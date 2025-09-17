// File: frontend/src/pages/Orders.jsx

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';

const Orders = () => {
  const { products, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Handle case where user is not logged in
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        console.error("Error fetching orders:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className='pt-16 border-t'>
      <div className='text-2xl'>
        <Title text1={'YOUR'} text2={'ORDERS'} />
      </div>
      <div>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={index} className='flex flex-col gap-4 py-4 text-gray-700 border-t border-b md:flex-row md:items-center md:justify-between'>
              {order.items.map((item, itemIndex) => {
                const productData = products.find(p => p._id === item._id);
                return productData ? (
                  <div key={itemIndex} className='flex items-start gap-6 text-sm'>
                    <img className='w-16 sm:w-20' src={productData.image[0]} alt="Photo" />
                    <div>
                      <p className='font-medium sm:text-base'>{productData.name}</p>
                      <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                        <p className='text-lg'>{currency}&nbsp;{productData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p>Quantity:&nbsp;{item.quantity}</p>
                        <p>Size:&nbsp;{item.size}</p>
                      </div>
                      <p className='mt-2'>Date:&nbsp;<span className='text-gray-400'>{new Date(order.date).toLocaleDateString()}</span></p>
                    </div>
                  </div>
                ) : null;
              })}
              <div className='flex justify-between md:w-1/2'>
                <div className='flex items-center gap-2'>
                  <p className='h-2 bg-green-500 rounded-full min-w-2'></p>
                  <p className='text-sm md:text-base'>{order.status}</p>
                </div>
                <button className='px-4 py-2 text-sm font-medium border rounded-sm'>TRACK ORDER</button>
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-gray-500">You have no orders yet.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;