"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export type CartItem = {
  id: number; // actual key for React
  course_id: number; // used for API remove logic
  title?: string;
  thumbnail?: string;
  price?: number;
};

export type CartContextType = {
  cart: CartItem[];
  cartLoading: boolean;
  addToCart: (courseId: number) => Promise<void>;
  removeFromCart: (courseId: number) => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user) {
      fetch(`https://ns.auwebx.com/api/cart/get_cart.php?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Cart loaded from API:", data.cart);
          setCart(data.cart || []);
        })
        .catch((err) => console.error("Failed to load cart:", err))
        .finally(() => setCartLoading(false));
    } else {
      setCartLoading(false);
    }
  }, []);

  const addToCart = async (courseId: number) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user) return;

    try {
      const res = await fetch(
        "https://ns.auwebx.com/api/cart/add_to_cart.php",
        {
          method: "POST",
          body: JSON.stringify({ user_id: user.id, course_id: courseId }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        const updatedCartRes = await fetch(
          `https://ns.auwebx.com/api/cart/get_cart.php?user_id=${user.id}`
        );
        const updatedCart = await updatedCartRes.json();
        console.log("Updated cart from API after add:", updatedCart.cart);
        setCart(updatedCart.cart || []);
      } else {
        console.error("Failed to add to cart:", data.message);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const removeFromCart = async (courseId: number) => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user?.id) return;

    try {
      const res = await fetch(
        "https://ns.auwebx.com/api/cart/remove_from_cart.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, course_id: courseId }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        toast.success("Removed from cart!");

        // Reload cart from server to refresh count and items
        const updatedCartRes = await fetch(
          `https://ns.auwebx.com/api/cart/get_cart.php?user_id=${user.id}`
        );
        const updatedCart = await updatedCartRes.json();
        setCart(updatedCart.cart || []);
      } else {
        toast.error("Failed to remove from cart: " + data.message);
        console.error("Remove from cart failed:", data.message);
      }
    } catch (err) {
      toast.error("Error removing from cart.");
      console.error("Remove from cart error:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, addToCart, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
