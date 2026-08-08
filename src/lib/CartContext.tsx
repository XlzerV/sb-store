"use client";

import React, { createContext, useContext, useReducer, useEffect, useRef } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; size: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const CartContext = createContext<{
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      if (action.payload.quantity <= 0) return state;
      const existing = state.items.findIndex(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size
      );
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = {
          ...items[existing],
          quantity: items[existing].quantity + action.payload.quantity,
        };
        return { items };
      }
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (i) => !(i.productId === action.payload.productId && i.size === action.payload.size)
        ),
      };
    case "UPDATE_QUANTITY": {
      const qty = Math.max(1, action.payload.quantity);
      return {
        items: state.items.map((i) =>
          i.productId === action.payload.productId && i.size === action.payload.size
            ? { ...i, quantity: qty }
            : i
        ),
      };
    }
    case "CLEAR_CART":
      return { items: [] };
    case "LOAD_CART":
      if (!Array.isArray(action.payload)) return state;
      return { items: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sb-cart");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            dispatch({ type: "LOAD_CART", payload: parsed });
          }
        } catch {}
      }
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (loaded.current) {
      try {
        localStorage.setItem("sb-cart", JSON.stringify(state.items));
      } catch {}
    }
  }, [state.items]);

  const addItem = (item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (productId: string, size: string) =>
    dispatch({ type: "REMOVE_ITEM", payload: { productId, size } });
  const updateQuantity = (productId: string, size: string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, size, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
