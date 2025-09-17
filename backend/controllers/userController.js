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

// Wishlist (same as before)
const addToWishlist = async (req, res) => { /* unchanged */ };
const removeFromWishlist = async (req, res) => { /* unchanged */ };
const getWishlist = async (req, res) => { /* unchanged */ };
const loginAdmin = async (req, res) => { /* unchanged */ };
const getUser = async (req, res) => { /* unchanged */ };
const forgotPassword = async (req, res) => { /* unchanged */ };
const resetPassword = async (req, res) => { /* unchanged */ };

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
