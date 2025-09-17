import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { FaRegHeart } from "react-icons/fa";

const NavBar = ({ setToken, token }) => {
    const [visible, setVisible] = useState(false);
    // Correctly get the `getCartCount` function from context
    const { setShowSearch, resetCart, getCartCount } = useContext(ShopContext);
    const navigate = useNavigate();

    const onLogout = () => {
        setToken("");
        localStorage.removeItem("token");
        resetCart();
        navigate("/");
        toast.info("Logged out successfully.");
    };

    const handleSearchClick = () => {
        navigate('/collection');
        setShowSearch(true);
    };

    // Call the `getCartCount` function to get the correct total
    const cartCount = getCartCount();

    return (
        <div className='flex items-center justify-between py-5 font-medium'>
            <Link to='/'>
                <img src={assets.logo} className='w-36' alt="Trendify" />
            </Link>

            <ul className='hidden gap-5 text-sm text-gray-700 sm:flex'>
                <NavLink to='/' className='flex flex-col items-center gap-1'>
                    <p>HOME</p>
                </NavLink>
                <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                    <p>COLLECTION</p>
                </NavLink>
                <NavLink to='/about' className='flex flex-col items-center gap-1'>
                    <p>ABOUT</p>
                </NavLink>
                <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                    <p>CONTACT</p>
                </NavLink>
            </ul>

            <div className='flex items-center gap-6'>
                <img
                    onClick={handleSearchClick}
                    src={assets.search_icon}
                    className='w-5 cursor-pointer'
                    alt="Search Products"
                />

                {!token ? (
                    <Link to='/login'>
                        <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="Your Profile" />
                    </Link>
                ) : (
                    <div className='flex items-center gap-4 relative'>
                        <Link to='/profile'>
                            <img
                                src={assets.profile_icon}
                                className='w-5 cursor-pointer'
                                alt="Your Profile"
                            />
                        </Link>
                        <Link to='/wishlist' className='relative'>
                            <FaRegHeart className='w-5 h-5 min-w-5' />
                        </Link>
                    </div>
                )}

                <Link to='/cart' className='relative'>
                    <img src={assets.cart_icon} className='w-5 min-w-5' alt="Cart" />
                    {cartCount > 0 && (
                        <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
                            {cartCount}
                        </p>
                    )}
                </Link>

                <img
                    onClick={() => setVisible(true)}
                    src={assets.menu_icon}
                    className='w-5 cursor-pointer sm:hidden'
                    alt="Menu Icon"
                />
            </div>

            {/* Sidebar for mobile */}
            <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                        <img src={assets.dropdown_icon} className='h-4 rotate-180' alt="Dropdown" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
                </div>
            </div>
        </div>
    );
};

export default NavBar;