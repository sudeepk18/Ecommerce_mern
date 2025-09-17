import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/order/list", {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error while fetching orders: ", error);
      toast.error("Error while fetching orders");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <>
      <div className="text-xl mb-4">All Orders</div>
      <div className="flex flex-col gap-2">
        {orders.map((order, index) => (
          <div
            key={index}
            className="border-2 border-gray-300 p-4 rounded-lg bg-white"
          >
            <div className="flex justify-between items-center text-sm mb-2">
              <p className="font-semibold text-gray-700">Order ID: {order._id}</p>
              <p className="text-gray-500">Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-r-2 pr-4">
                <p className="font-medium text-lg mb-2">Products</p>
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-4 mb-2">
                    <img className="w-16 h-16 object-cover" src={item.image[0]} alt={item.name} />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500 text-sm">
                        Qty: {item.quantity} | Size: {item.size}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Price: ${item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-medium text-lg mb-2">Customer Info</p>
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {order.address.firstName} {order.address.lastName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {order.address.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Address:</span> {order.address.street}, {order.address.city}, {order.address.state}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Total Amount:</span> ${order.amount}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="h-2 w-2 bg-green-500 rounded-full"></p>
                  <p className="text-sm font-medium">{order.status}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Orders;