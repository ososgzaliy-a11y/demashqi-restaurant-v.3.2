import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item, quantity) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (name) => {
    setCart(prev => prev.filter(i => i.name !== name));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => {
    let priceVal = 0;
    if (typeof item.price === 'number') {
      priceVal = item.price;
    } else if (typeof item.price === 'string') {
      const priceMatch = item.price.match(/(\d+)/);
      priceVal = priceMatch ? parseInt(priceMatch[0]) : 0;
    }
    return total + (priceVal * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
