import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";

const ProductItem = ({ id, image, name, price }) => {
  const { currency, wishlist, addToWishlist, removeFromWishlist } = useContext(ShopContext);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(wishlist.includes(id));
  }, [wishlist, id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  return (
    <div className="relative">
      <button onClick={toggleWishlist} className="absolute top-2 right-2 text-xl z-10">
        {isWishlisted ? <FaHeart color="red" /> : <FaRegHeart />}
      </button>
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
        <div className="overflow-hidden">
          <img
            className="transition ease-in-out hover:scale-110"
            src={image[0]}
            alt="Product"
          />
        </div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">
          {currency}&nbsp;
          {price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </Link>
    </div>
  );
};

export default ProductItem;