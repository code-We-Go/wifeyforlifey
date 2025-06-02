'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cartContext } from './context/cartContext';
import { CartItem } from './interfaces/interfaces';
import { wishListContext } from './context/wishListContext';

export default function WishListProvider({ children }: { children: ReactNode }) {
  const [wishList, setWishList] = useState<CartItem[]>([]);
  const [wishListUpdated, setWishListUpdated] = useState(false);
    useEffect(() => {
      const storedWishList = localStorage.getItem("wishList");
      if (storedWishList) {
        setWishList(JSON.parse(storedWishList));
      }
    }, []);
  
    // Persist cart to localStorage whenever it changes
    useEffect(() => {
      localStorage.setItem("wishList", JSON.stringify(wishList));
    }, [wishList]);

  return (
    <wishListContext.Provider value={{ wishList, setWishList,wishListUpdated,setWishListUpdated }}>
      {children}
    </wishListContext.Provider>
  );
}
