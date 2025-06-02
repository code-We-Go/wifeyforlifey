import { createContext } from "react";
import { CartItem } from "../interfaces/interfaces";

// export const cartContext=createContext<CartItem[]>([]);

interface WishListContextType {
    wishList: CartItem[];
    setWishList: React.Dispatch<React.SetStateAction<CartItem[]>>;
    wishListUpdated: boolean;
    setWishListUpdated: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
 export  const wishListContext = createContext<WishListContextType>({
    wishList: [],
    setWishList: () => {},
    wishListUpdated: false,
    setWishListUpdated: () => {},
  });