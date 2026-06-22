"use client";

import { attribute, CartItem, Variant, SubscriptionCartItem } from "@/app/interfaces/interfaces";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (
    productId: string,
    variant: Variant,
    attribute: attribute
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variant: Variant,
    attribute: attribute
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Subscriptions extension
  subscriptionItems: SubscriptionCartItem[];
  addSubscription: (item: Omit<SubscriptionCartItem, "cartItemId">) => void;
  removeSubscription: (cartItemId: string) => void;
  updateSubscriptionQuantity: (cartItemId: string, quantity: number) => void;
  clearSubscriptions: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subscriptionItems, setSubscriptionItems] = useState<SubscriptionCartItem[]>([]);

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

    const storedSubCart = localStorage.getItem("subscriptionCart");
    if (storedSubCart) {
      try {
        setSubscriptionItems(JSON.parse(storedSubCart));
      } catch (error) {
        console.error("Failed to parse subscriptionCart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("subscriptionCart", JSON.stringify(subscriptionItems));
  }, [subscriptionItems]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) =>
          i.productId === item.productId &&
          i.attributes?.name === item.attributes?.name &&
          i.variant?.name === item.variant?.name
      );
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === item.productId &&
          i.attributes?.name === item.attributes?.name &&
          i.variant?.name === item.variant?.name
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeItem = (
    productId: string,
    variant: Variant,
    attribute: attribute
  ) => {
    setItems((prevItems) =>
      prevItems.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.attributes?.name === attribute?.name &&
            i.variant?.name === variant?.name
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    variant: Variant,
    attribute: attribute
  ) => {
    if (quantity <= 0) {
      removeItem(productId, variant, attribute);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId &&
        item.attributes?.name === attribute?.name &&
        item.variant?.name === variant?.name
          ? { ...item, quantity }
          : item
      )
    );
  };

  const addSubscription = (item: Omit<SubscriptionCartItem, "cartItemId">) => {
    setSubscriptionItems((prev) => {
      const existing = prev.find(
        (i) => i.packageId === item.packageId && i.duration === item.duration
      );
      if (existing) {
        return prev.map((i) =>
          i.packageId === item.packageId && i.duration === item.duration
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      const newSub: SubscriptionCartItem = {
        ...item,
        cartItemId: `${item.packageId}-${item.duration}`
      };
      return [...prev, newSub];
    });
  };

  const removeSubscription = (cartItemId: string) => {
    setSubscriptionItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateSubscriptionQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeSubscription(cartItemId);
      return;
    }
    setSubscriptionItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearSubscriptions = () => {
    setSubscriptionItems([]);
    localStorage.removeItem("subscriptionCart");
  };

  const clearCart = () => {
    setItems([]);
    setSubscriptionItems([]);
    localStorage.removeItem("cart");
    localStorage.removeItem("subscriptionCart");
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0) + subscriptionItems.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  ) + subscriptionItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

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
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        subscriptionItems,
        addSubscription,
        removeSubscription,
        updateSubscriptionQuantity,
        clearSubscriptions,
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
