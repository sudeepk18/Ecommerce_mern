// File: frontend/src/pages/Wishlist.jsx

import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import Title from '../components/Title';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const { wishlist, products } = useContext(ShopContext);
  const wishlistProducts = products.filter(product => wishlist.includes(product._id));

  return (
    <div className='pt-10 border-t'>
      <div className='text-2xl text-center'>
        <Title text1={'YOUR'} text2={'WISHLIST'} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6">
        {wishlistProducts.length > 0 ? (
          wishlistProducts.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 my-8 col-span-full">Your wishlist is empty.</p>
        )}
      </div>
    </div>
  );
};

export default Wishlist;