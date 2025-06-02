"use client";

import { attribute, CartItem, Variant } from "@/app/interfaces/interfaces";
import { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string , variant:Variant ,attribute:attribute) => void;
  updateQuantity: (productId: string, quantity: number,variant:Variant ,attribute:attribute) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on client side
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => (i.productId === item.productId && i.attributes.name === item.attributes.name));
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeItem = (productId: string,variant:Variant ,attribute:attribute) => {
    setItems((prevItems) => prevItems.filter((i) => (i.productId !== productId && i.attributes !== attribute && i.variant !== variant)));
  };

  const updateQuantity = (productId: string, quantity: number,variant:Variant ,attribute:attribute) => {
    // if (quantity <= 0) {
    //   removeItem(productId);
    //   return;
    // }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
       ( item.productId === productId  && item.attributes === attribute && item.variant === variant)? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}