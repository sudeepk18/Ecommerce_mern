import { createContext, useEffect, useState } from "react";
import { products as localProducts } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children, setToken }) => {
  const [products, setProducts] = useState(localProducts);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const currency = "$";
  const delivery_fee = 10;

  const fetchProducts = async () => { /* unchanged */ };
  const loadCartData = async () => { /* unchanged */ };
  const loadWishlist = async () => { /* unchanged */ };
  const addToWishlist = async (itemId) => { /* unchanged */ };
  const removeFromWishlist = async (itemId) => { /* unchanged */ };

  const updateCartOnServer = async (itemId, size, itemQuantity) => {
    if (!token) return;
    await axios.post(
      "http://localhost:4000/api/user/add-to-cart",
      { itemId, size, itemQuantity },
      { headers: { token } }
    );
  };

  useEffect(() => {
    fetchProducts();
    loadCartData();
    loadWishlist();
  }, [token]);

  const addToCart = async (itemId, size) => {
    if (!token) {
      toast.info("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    if (!size) {
      toast.error("Please Select a Size");
      return;
    }

    toast.success("Item Added To The Cart");
    setCartItems((prev) => {
      const updated = structuredClone(prev);
      if (!updated[itemId]) updated[itemId] = {};
      updated[itemId][size] = (updated[itemId][size] || 0) + 1;
      updateCartOnServer(itemId, size, updated[itemId][size]);
      return updated;
    });
  };

  const updateQuantity = async (itemId, size, newQuantity) => {
    if (!token) {
      toast.info("Please login to update your cart.");
      navigate("/login");
      return;
    }
    setCartItems((prev) => {
      const updated = structuredClone(prev);
      if (newQuantity > 0) {
        updated[itemId][size] = newQuantity;
      } else {
        delete updated[itemId][size];
        if (Object.keys(updated[itemId]).length === 0) {
          delete updated[itemId];
        }
      }
      updateCartOnServer(itemId, size, newQuantity);
      return updated;
    });
  };

  const removeEntirelyFromCart = async (itemId, size) => {
    updateQuantity(itemId, size, 0);
    toast.success("Product removed from cart!");
  };

  const resetCart = () => setCartItems({});

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        totalCount += cartItems[items][item];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((p) => p._id === items);
      for (const item in cartItems[items]) {
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[items][item];
        }
      }
    }
    return totalAmount;
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    getCartAmount,
    navigate,
    resetCart,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    setToken,
    updateQuantity,
    removeEntirelyFromCart,
  };

  return (
    <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
