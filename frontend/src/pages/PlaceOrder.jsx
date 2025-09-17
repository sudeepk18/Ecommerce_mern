import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const { navigate, cartItems, products, getCartAmount, delivery_fee, resetCart } = useContext(ShopContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];

    products.forEach((product) => {
      for (const size in cartItems[product._id]) {
        if (cartItems[product._id][size] > 0) {
          let itemInfo = product;
          let quantity = cartItems[product._id][size];
          let item = { ...itemInfo, size, quantity };
          orderItems.push(item);
        }
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: getCartAmount() + delivery_fee,
    };

    try {
      const response = await axios.post(
        "http://localhost:4000/api/order/place",
        orderData,
        { headers: { token: localStorage.getItem("token") } }
      );
      if (response.data.success) {
        toast.success("Order Placed Successfully!");
        resetCart(); // Call resetCart after a successful order
        navigate("/orders");
      } else {
        toast.error("Error placing order.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, []);

  return (
    <form onSubmit={placeOrder} className='flex flex-col justify-between gap-4 pt-5 sm:flex-row sm:pt-14 min-h-[80vh] border-t'>
      {/* Left Side Content */}
      <div className='flex flex-col w-full gap-4 sm:max-w-[480px]'>
        <div className='my-3 text-xl sm:text-2xl'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className='flex gap-3'>
          <input
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            className='w-full px-4 py-2 border border-gray-300 rounded'
            type="text"
            placeholder='First Name'
            required
          />
          <input
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            className='w-full px-4 py-2 border border-gray-300 rounded'
            type="text"
            placeholder='Last Name'
            required
          />
        </div>
        <input
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          className='w-full px-4 py-2 border border-gray-300 rounded'
          type="email"
          placeholder='Email Address'
          required
        />
        <input
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          className='w-full px-4 py-2 border border-gray-300 rounded'
          type="text"
          placeholder='Street'
          required
        />
        <div className='flex gap-3'>
          <input
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            className='w-full px-4 py-2 border border-gray-300 rounded'
            type="text"
            placeholder='City'
            required
          />
          <input
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            className='w-full px-4 py-2 border border-gray-300 rounded'
            type="text"
            placeholder='State'
            required
          />
        </div>
        <div className='flex gap-3'>
          <input
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            className='w-full px-4 py-2 border border-gray-300 rounded'
            type="number"
            placeholder='Zip Code'
            required
          />
          <input
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            className='w-full px-4 py-2 border border-gray-300 rounded'
            type="text"
            placeholder='Country'
            required
          />
        </div>
        <input
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          className='w-full px-4 py-2 border border-gray-300 rounded'
          type="number"
          placeholder='Mobile'
          required
        />
      </div>
      {/* Right Side Content */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>
        {/* Payment Methods Selection */}
        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHODS'} />
          <div className='flex flex-col gap-3 lg:flex-row'>
            <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 p-2 px-3 border cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-600' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 p-2 px-3 border cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-600' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.razorpay_logo} alt="RazorPay" />
            </div>
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 p-2 px-3 border cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-600' : ''}`}></p>
              <p className='mx-4 text-sm font-medium text-gray-500'>CASH ON DELIVERY</p>
            </div>
          </div>
          <div className='w-full mt-8 text-end'>
            <button type='submit' className='px-16 py-3 text-sm text-white bg-black active:bg-gray-800'>PLACE ORDER</button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder;