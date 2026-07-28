import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('demashqi_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('demashqi_cart', JSON.stringify(cart));
  }, [cart]);

  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);

  const addToCart = (item, quantity) => {
    setCart(prev => {
      const itemConfigKey = `${item.name}-${item.selectedSpiciness || ''}-${(item.selectedSauces || []).sort().join(',')}`;
      const existingIndex = prev.findIndex(i => {
        const iConfigKey = `${i.name}-${i.selectedSpiciness || ''}-${(i.selectedSauces || []).sort().join(',')}`;
        return iConfigKey === itemConfigKey;
      });

      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { ...item, cartItemId: Date.now().toString() + Math.random(), quantity }];
    });
  };

  const removeFromCart = (idOrName) => {
    setCart(prev => prev.filter(i => (i.cartItemId || i.name) !== idOrName));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    setCart(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const updateCartItem = (cartItemId, updatedData) => {
    setCart(prev => prev.map(item =>
      item.cartItemId === cartItemId ? { ...updatedData, cartItemId } : item
    ));
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
    const extras = item.extraSaucePrice || 0;
    return total + ((priceVal + extras) * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateCartItem, clearCart, cartTotal, isCheckoutOpen, openCheckout, closeCheckout }}>
      {children}
    </CartContext.Provider>
  );
};
