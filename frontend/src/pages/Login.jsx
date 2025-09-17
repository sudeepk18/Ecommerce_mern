import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';

const Login = ({ setToken }) => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { resetCart } = useContext(ShopContext);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const url = "http://localhost:4000";

    try {
      if (currentState === "Login") {
        const response = await axios.post(`${url}/api/user/login`, data);
        if (response.data.success) {
          setToken(response.data.token);
          toast.success("Login successful!");
          resetCart();
          navigate('/');
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(`${url}/api/user/register`, data);
        if (response.data.success) {
          setToken(response.data.token);
          toast.success("Registration successful!");
          resetCart();
          navigate('/');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      toast.error("An error occurred. Please try again.");
    }
  };
  
  const handleForgotPassword = async (event) => {
    event.preventDefault();
    const url = "http://localhost:4000";
    try {
      const response = await axios.post(`${url}/api/user/forgot-password`, { email: data.email });
      if (response.data.success) {
        toast.success(response.data.message);
        setShowForgotPassword(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
        <div className="inline-flex items-center gap-2 mt-10 mb-2">
          <p className="text-3xl prata-regular">{currentState}</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>
        {currentState === "Login" ? (
          ""
        ) : (
          <input
            name="name"
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="John Doe"
            required={currentState === "Sign Up"}
          />
        )}
        <input
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="hello@gmail.com"
          required
        />
        <input
          name="password"
          onChange={onChangeHandler}
          value={data.password}
          type="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Password"
          required
        />
        <div className="flex justify-between w-full text-sm mt-[-8px]">
          <p onClick={() => setShowForgotPassword(true)} className="cursor-pointer">Forgot your password?</p>
          {currentState === "Login" ? (
            <p
              onClick={() => setCurrentState("Sign Up")}
              className="cursor-pointer"
            >
              Create a new account
            </p>
          ) : (
            <p
              onClick={() => setCurrentState("Login")}
              className="cursor-pointer"
            >
              Login here
            </p>
          )}
        </div>
        <button className="px-8 py-2 mt-4 font-light text-white bg-black">{currentState === "Login" ? "Sign In" : "Sign Up"}</button>
      </form>
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <form onSubmit={handleForgotPassword} className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
            <h2 className="mb-4 text-2xl font-bold">Forgot Password</h2>
            <p className="mb-4 text-sm text-gray-600">Enter your email to receive a password reset link.</p>
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              className="w-full px-3 py-2 mb-4 border border-gray-300 rounded"
              placeholder="hello@gmail.com"
              required
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForgotPassword(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 text-white bg-black rounded">Send Link</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Login;