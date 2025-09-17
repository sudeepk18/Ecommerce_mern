import express from "express";
import {
  loginUser,
  registerUser,
  loginAdmin,
  addToCart,
  removeFromCart,
  getCart,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getUser,
  forgotPassword, // New controller function
  resetPassword,  // New controller function
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", loginAdmin);
userRouter.post("/add-to-cart", authMiddleware, addToCart);
userRouter.post("/remove-from-cart", authMiddleware, removeFromCart);
userRouter.post("/get-cart", authMiddleware, getCart);
userRouter.post("/add-to-wishlist", authMiddleware, addToWishlist);
userRouter.post("/remove-from-wishlist", authMiddleware, removeFromWishlist);
userRouter.post("/get-wishlist", authMiddleware, getWishlist);
userRouter.post("/get-user", authMiddleware, getUser);
userRouter.post("/forgot-password", forgotPassword); // New route
userRouter.post("/reset-password", resetPassword);    // New route

export default userRouter;