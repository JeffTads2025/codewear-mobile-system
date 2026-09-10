import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product } from '../data/products';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

export interface CartItem {
  id?: number;
  product: Product;
  size: string;
  quantity: number;
}

interface CartContextData {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  updateQuantity: (productId: string, size: string, delta: number) => Promise<void>;
  clearCart: () => void;
  totalCartValue: number;
  cartCount: number;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    let active = true;
    api.get('cart').then(({ data }) => {
      if (!active) return;
      const serverItems = Array.isArray(data) ? data : data.items ?? [];
      setCartItems(serverItems.map((item: { id: number; quantity: number; size?: string; Product?: Product; product?: Product }) => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size ?? '',
        product: item.product ?? item.Product!,
      })));
    }).catch(() => {
      if (active) setCartItems([]);
    });

    return () => { active = false; };
  }, [isAuthenticated, user?.id]);

  const addToCart = async (product: Product, size: string, quantity: number) => {
    const { data } = await api.post<{ id: number }>('cart', {
      productId: Number(product.id),
      quantity,
      size,
    });

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].id = data.id ?? updated[existingIndex].id;
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { id: data.id, product, size, quantity }];
    });
  };

  const removeFromCart = async (productId: string, size: string) => {
    const item = cartItems.find((entry) => String(entry.product.id) === String(productId) && entry.size === size);
    if (item?.id) await api.delete(`cart/${item.id}`);

    setCartItems((prev) =>
      prev.filter(
        (item) => !(String(item.product.id) === String(productId) && item.size === size)
      )
    );
  };

  const updateQuantity = async (productId: string, size: string, delta: number) => {
    const item = cartItems.find((entry) => String(entry.product.id) === String(productId) && entry.size === size);
    if (!item?.id) return;
    const newQuantity = item.quantity + delta;

    if (newQuantity < 1) {
      await removeFromCart(productId, size);
      return;
    }

    await api.put(`cart/${item.id}`, { quantity: newQuantity });
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (String(item.product.id) === String(productId) && item.size === size) {
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCartValue = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price ?? item.product.preco ?? 0) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCartValue,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context;
}