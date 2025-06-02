"use client";
import React, { useContext } from "react";
import { wishListContext } from "../context/wishListContext";

const WishlistPage = () => {
  const { wishList, setWishList } = useContext(wishListContext);
  return (
    <div className="container-custom py-16 max-w-4xl mx-auto text-center">
      WishlistPage {wishList.length}
    </div>
  );
};

export default WishlistPage;
