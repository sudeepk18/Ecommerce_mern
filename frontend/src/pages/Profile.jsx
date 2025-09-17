import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
    const { navigate, setToken } = useContext(ShopContext);
    const [user, setUser] = useState(null);

    const fetchUserData = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Correctly sending the token in the request headers
                const response = await axios.post("http://localhost:4000/api/user/get-user", {}, { headers: { token } });
                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    toast.error("Error fetching user data.");
                    console.error("Error fetching user data:", response.data.message);
                }
            } catch (error) {
                toast.error("Network error while fetching user data.");
                console.error("Network error while fetching user data:", error);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const onLogout = () => {
        setToken("");
        localStorage.removeItem("token");
        navigate("/");
    };
    
    if (!user) {
        return <div className='text-center pt-14'>Loading user data...</div>;
    }

    return (
        <div className='border-t pt-14 min-h-screen'>
            <div className='mb-3 text-2xl'>
                <Title text1={'USER'} text2={'PROFILE'} />
            </div>
            <div className='flex flex-col gap-6 p-6 border rounded-lg max-w-lg mx-auto bg-gray-50'>
                <div className='flex items-center gap-4'>
                    <img src={assets.profile_icon} alt="User Profile" className="w-12 h-12" />
                    <div>
                        <p className='text-lg font-semibold'>{user.name}</p>
                        <p className='text-sm text-gray-500'>{user.email}</p>
                    </div>
                </div>
                <hr />
                <div className='flex flex-col gap-2'>
                    <p className='text-lg font-semibold'>Account Information</p>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                </div>
                <div className='flex flex-col gap-2'>
                    <p className='text-lg font-semibold'>My Orders</p>
                    <button onClick={() => navigate('/orders')} className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800'>View All Orders</button>
                </div>
                <div className='mt-4'>
                    <button onClick={onLogout} className='w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600'>Logout</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;