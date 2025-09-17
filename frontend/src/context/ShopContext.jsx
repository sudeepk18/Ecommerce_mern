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

  // Fetch products from server + merge with local products
  const fetchProducts = async () => {
    try {
      const url = "http://localhost:4000";
      const response = await axios.get(url + "/api/product/list");

      if (response.data.success) {
        const combined = [...localProducts, ...response.data.products];
        const uniqueProducts = combined.filter(
          (product, index, self) =>
            index === self.findIndex((p) => p._id === product._id)
        );
        setProducts(uniqueProducts);
      } else {
        setProducts(localProducts);
        toast.error("Error fetching products from server.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(localProducts);
      toast.error("Network error, showing local products.");
    }
  };

  const loadCartData = async () => {
    if (!token) return;
    try {
      const url = "http://localhost:4000";
      const response = await axios.post(url + "/api/user/get-cart", {}, { headers: { token } });
      if (response.data.success) setCartItems(response.data.cartData);
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  };

  const loadWishlist = async () => {
    if (!token) return;
    try {
      const url = "http://localhost:4000";
      const response = await axios.post(url + "/api/user/get-wishlist", {}, { headers: { token } });
      if (response.data.success) setWishlist(response.data.wishlist);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  };

  const addToWishlist = async (itemId) => {
    if (!token) {
      toast.info("Please login to add items to your wishlist.");
      navigate("/login");
      return;
    }
    try {
      const url = "http://localhost:4000";
      const response = await axios.post(url + "/api/user/add-to-wishlist", { itemId }, { headers: { token } });
      if (response.data.success) {
        setWishlist(prev => [...prev, itemId]);
        toast.success("Product added to wishlist!");
      } else toast.error("Error adding to wishlist.");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const removeFromWishlist = async (itemId) => {
    if (!token) return;
    try {
      const url = "http://localhost:4000";
      const response = await axios.post(url + "/api/user/remove-from-wishlist", { itemId }, { headers: { token } });
      if (response.data.success) {
        setWishlist(prev => prev.filter(id => id !== itemId));
        toast.info("Product removed from wishlist.");
      } else toast.error("Error removing from wishlist.");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const updateCartOnServer = async (itemId, size, itemQuantity) => {
    if (!token) return;
    try {
      await axios.post("http://localhost:4000/api/user/add-to-cart", { itemId, size, itemQuantity }, { headers: { token } });
    } catch (error) {
      console.error("Error updating cart on server:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    loadCartData();
    loadWishlist();
  }, [token]);

  // Add to cart with toast
  const addToCart = async (itemId, size) => {
    if (!token) {
      toast.info("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    if (!size) {
      toast.error("Please select a size");
      return;
    }

    setCartItems(prev => {
      const updated = structuredClone(prev);
      if (!updated[itemId]) updated[itemId] = {};
      updated[itemId][size] = (updated[itemId][size] || 0) + 1;
      updateCartOnServer(itemId, size, updated[itemId][size]);
      return updated;
    });

    toast.success("Item added to cart!");
  };

  // Update quantity with toast when removed
  const updateQuantity = async (itemId, size, newQuantity) => {
    if (!token) {
      toast.info("Please login to update cart.");
      navigate("/login");
      return;
    }

    setCartItems(prev => {
      const updated = structuredClone(prev);

      if (newQuantity > 0) {
        updated[itemId][size] = newQuantity;
      } else {
        if (updated[itemId] && updated[itemId][size]) {
          delete updated[itemId][size];
          if (Object.keys(updated[itemId]).length === 0) delete updated[itemId];
          toast.info("Item removed from cart!"); // ✅ toast for removal
        }
      }

      updateCartOnServer(itemId, size, newQuantity);
      return updated;
    });
  };

  const removeEntirelyFromCart = async (itemId, size) => {
    updateQuantity(itemId, size, 0);
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
      const itemInfo = products.find(p => p._id === items);
      for (const item in cartItems[items]) {
        if (itemInfo) totalAmount += itemInfo.price * cartItems[items][item];
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
    updateQuantity,
    removeEntirelyFromCart,
    getCartCount,
    getCartAmount,
    navigate,
    resetCart,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    setToken,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
