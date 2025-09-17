import React, { useState, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShopContextProvider from './context/ShopContext.jsx';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword'; // New import

const ProductWrapper = () => {
  const { productId } = useParams();
  return <Product key={productId} />;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <NavBar setToken={setToken} token={token} />
      {/* Pass setToken to the context provider */}
      <ShopContextProvider setToken={setToken}>
        <SearchBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/product/:productId' element={<ProductWrapper />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<Login setToken={setToken} />} />
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} /> {/* New route */}
        </Routes>
        <Footer />
      </ShopContextProvider>
    </div>
  );
};

export default App;