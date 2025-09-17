import { createContext, useEffect, useState } from "react";
import { products as localProducts } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

// Accept setToken as a prop
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

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/product/list");
      if (response.data.success && response.data.products.length > 0) {
        const combinedProducts = [...localProducts, ...response.data.products];
        const uniqueProducts = combinedProducts.filter((product, index, self) =>
          index === self.findIndex((p) => (p._id === product._id))
        );
        setProducts(uniqueProducts);
      } else {
        setProducts(localProducts);
      }
    } catch (error) {
      console.error("Error fetching products: ", error);
      setProducts(localProducts);
      toast.error("Network error, falling back to local products.");
    }
  };

  const loadCartData = async () => {
    if (token) {
      try {
        const response = await axios.post("http://localhost:4000/api/user/get-cart", {}, { headers: { token } });
        if (response.data.success) {
          setCartItems(response.data.cartData);
        } else {
          console.error("Error fetching cart data:", response.data.message);
        }
      } catch (error) {
        console.error("Network error while fetching cart data:", error);
      }
    } else {
      setCartItems({});
    }
  };

  const loadWishlist = async () => {
    if (token) {
        try {
            const response = await axios.post("http://localhost:4000/api/user/get-wishlist", {}, { headers: { token } });
            if (response.data.success) {
                setWishlist(response.data.wishlist);
            }
        } catch (error) {
            console.error("Error fetching wishlist: ", error);
        }
    }
  };

  const addToWishlist = async (itemId) => {
      if (!token) {
          toast.info("Please login to add to your wishlist.");
          navigate('/login');
          return;
      }
      await axios.post("http://localhost:4000/api/user/add-to-wishlist", { itemId }, { headers: { token } });
      setWishlist(prev => [...prev, itemId]);
      toast.success("Item added to wishlist!");
  };

  const removeFromWishlist = async (itemId) => {
      if (!token) return;
      await axios.post("http://localhost:4000/api/user/remove-from-wishlist", { itemId }, { headers: { token } });
      setWishlist(prev => prev.filter(id => id !== itemId));
      toast.info("Item removed from wishlist.");
  };
  
  const updateCartOnServer = async (itemId, size, itemQuantity) => {
    if (!token) {
      return;
    }
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
      navigate('/login');
      return;
    }

    if (!size) {
      toast.error("Please Select a Size");
      return;
    } else {
      toast.success("Item Added To The Cart");
    }
    
    setCartItems(prevCartItems => {
        const updatedCartItems = structuredClone(prevCartItems);
        
        if (!updatedCartItems[itemId]) {
            updatedCartItems[itemId] = {};
        }
        
        updatedCartItems[itemId][size] = (updatedCartItems[itemId][size] || 0) + 1;
        
        updateCartOnServer(itemId, size, updatedCartItems[itemId][size]);

        return updatedCartItems;
    });
  };

  const removeFromCart = async (itemId, size) => {
    if (!token) {
      return;
    }
    
    setCartItems(prevCartItems => {
      const updatedCartItems = structuredClone(prevCartItems);

      if (updatedCartItems[itemId] && updatedCartItems[itemId][size]) {
        if (updatedCartItems[itemId][size] > 1) {
            updatedCartItems[itemId][size] -= 1;
        } else {
            delete updatedCartItems[itemId][size];
            if (Object.keys(updatedCartItems[itemId]).length === 0) {
                delete updatedCartItems[itemId];
            }
        }
      }

      updateCartOnServer(itemId, size, updatedCartItems[itemId]?.[size] || 0);

      return updatedCartItems;
    });
  };
  
  const resetCart = () => {
    setCartItems({});
  };
  
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalCount += cartItems[items][item];
        }
      }
    }
    return totalCount;
  };
  
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        if (itemInfo && cartItems[items][item] > 0) {
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
    removeFromCart,
    resetCart,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    setToken // Provide setToken through context
  };

  return (
    <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;