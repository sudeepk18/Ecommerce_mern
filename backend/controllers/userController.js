import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel.js";
import crypto from "crypto";
import sendEmail from "../services/emailService.js"; // New import

// INFO: Function to create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// INFO: Route for user login
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

// INFO: Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // INFO: Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // INFO: Validating email and password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // INFO: Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // INFO: Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // INFO: Save user to database
    const user = await newUser.save();

    // INFO: Create token
    const token = createToken(user._id);

    // INFO: Return success response
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log("Error while registering user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for adding to cart
const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    const cartData = user.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    console.log("Error while getting user cart: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// INFO: Route for adding to cart
const addToCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    let cartData = user.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = {};
    }
    cartData[req.body.itemId][req.body.size] = req.body.itemQuantity;
    await userModel.findByIdAndUpdate(req.userId, { cartData });
    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.log("Error while adding to user cart: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// INFO: Route for removing from cart
const removeFromCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    let cartData = user.cartData;
    if (cartData[req.body.itemId][req.body.size] > 0) {
      cartData[req.body.itemId][req.body.size] -= 1;
    }
    await userModel.findByIdAndUpdate(req.userId, { cartData });
    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.log("Error while removing from user cart: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// INFO: Route for adding product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    let wishlist = user.wishlist || [];
    if (!wishlist.includes(req.body.itemId)) {
        wishlist.push(req.body.itemId);
        await userModel.findByIdAndUpdate(req.userId, { wishlist });
    }
    res.json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    console.log("Error while adding to wishlist: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// INFO: Route for removing product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    let wishlist = user.wishlist || [];
    const index = wishlist.indexOf(req.body.itemId);
    if (index > -1) {
        wishlist.splice(index, 1);
        await userModel.findByIdAndUpdate(req.userId, { wishlist });
    }
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.log("Error while removing from wishlist: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// INFO: Route for fetching user's wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.log("Error while fetching wishlist: ", error);
    res.json({ success: false, message: "Error" });
  }
};

// INFO: Route for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);

      res.status(200).json({ success: true, token });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in admin: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for getting user data
const getUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId); // Use req.userId
        if (user) {
            res.json({ success: true, user: { name: user.name, email: user.email } });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.log("Error while fetching user data: ", error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// New: Route for forgot password functionality
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Email not found." });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 3600000;

    await userModel.findByIdAndUpdate(user._id, {
      resetPasswordToken,
      resetPasswordExpires
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Email content
    const message = `
      <p>You are receiving this because you (or someone else) has requested to reset the password for your account.</p>
      <p>Please click on the following link, or paste this into your browser to complete the process:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: message,
    });

    res.json({ success: true, message: "Password reset link sent to your email." });

  } catch (error) {
    console.error("Error in forgotPassword: ", error);
    res.json({ success: false, message: "Something went wrong." });
  }
};

// New: Route for resetting password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired token." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Password has been reset successfully." });

  } catch (error) {
    console.error("Error in resetPassword: ", error);
    res.json({ success: false, message: "Something went wrong." });
  }
};


export { loginUser, registerUser, loginAdmin, getCart, addToCart, removeFromCart, addToWishlist, removeFromWishlist, getWishlist, getUser, forgotPassword, resetPassword };