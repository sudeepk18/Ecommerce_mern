import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel.js";
import crypto from "crypto";
import sendEmail from "../services/emailService.js";

// Create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      const token = createToken(user._id);
      res.status(200).json({ success: true, token });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log("Error while registering user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cart
const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const cartData = user.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.log("Error while getting user cart: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// Add/Update cart
const addToCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    let cartData = user.cartData || {};
    const { itemId, size, itemQuantity } = req.body;

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    if (itemQuantity !== undefined) {
      if (itemQuantity > 0) {
        cartData[itemId][size] = itemQuantity;
      } else {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    }

    await userModel.findByIdAndUpdate(req.userId, { cartData });
    res.json({ success: true, cartData });
  } catch (error) {
    console.log("Error while adding to user cart: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// Remove (decrease by 1)
const removeFromCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    let cartData = user.cartData || {};
    const { itemId, size } = req.body;

    if (cartData[itemId] && cartData[itemId][size] > 0) {
      cartData[itemId][size] -= 1;
      if (cartData[itemId][size] === 0) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    }

    await userModel.findByIdAndUpdate(req.userId, { cartData });
    res.json({ success: true, cartData });
  } catch (error) {
    console.log("Error while removing from user cart: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// Wishlist
const addToWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const { itemId } = req.body;

    if (!user.wishlist.includes(itemId)) {
      user.wishlist.push(itemId);
      await user.save();
    }
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.log("Error while adding to wishlist: ", error);
    res.json({ success: false, message: "Error" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const { itemId } = req.body;
    user.wishlist = user.wishlist.filter((id) => id !== itemId);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.log("Error while removing from wishlist: ", error);
    res.json({ success: false, message: "Error" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    console.log("Error while getting wishlist: ", error);
    res.json({ success: false, message: "Error" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD,
      process.env.JWT_SECRET
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log("Error while logging in admin: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.log("Error while getting user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User with this email does not exist." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>Please go to this link to reset your password:</p>
      <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
      });
      res.status(200).json({ success: true, message: "Password reset link sent to your email." });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error("Email could not be sent:", emailError);
      res.status(500).json({ success: false, message: "Email could not be sent. Please try again later." });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

export {
  loginUser,
  registerUser,
  loginAdmin,
  getCart,
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getUser,
  forgotPassword,
  resetPassword,
};