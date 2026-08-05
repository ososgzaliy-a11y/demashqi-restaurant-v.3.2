import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('demashqi_cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      if (!Array.isArray(parsed)) throw new Error('Cart data is corrupted (not an array)');
      return parsed;
    } catch (err) {
      console.error('Cart parse error, resetting to empty:', err);
      localStorage.removeItem('demashqi_cart');
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
      const itemConfigKey = `${item?.name}-${item?.selectedSpiciness || ''}-${(Array.isArray(item?.selectedSauces) ? item.selectedSauces : []).sort().join(',')}-${item?.specialNote || ''}`;
      const existingIndex = prev.findIndex(i => {
        if (!i) return false;
        const iConfigKey = `${i.name}-${i.selectedSpiciness || ''}-${(Array.isArray(i.selectedSauces) ? i.selectedSauces : []).sort().join(',')}-${i.specialNote || ''}`;
        return iConfigKey === itemConfigKey;
      });

      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { ...item, cartItemId: Date.now().toString() + Math.random(), quantity }];
    });
    window.dispatchEvent(new CustomEvent('itemAddedToCart'));
  };

  const removeFromCart = (idOrName) => {
    setCart(prev => prev.filter(i => i && (i.cartItemId || i.name) !== idOrName));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    setCart(prev => prev.map(item => 
      item && item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const updateCartItem = (cartItemId, updatedData) => {
    setCart(prev => prev.map(item =>
      item && item.cartItemId === cartItemId ? { ...updatedData, cartItemId } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = (cart || []).reduce((total, item) => {
    if (!item) return total;
    let priceVal = 0;
    if (typeof item?.price === 'number') {
      priceVal = item.price;
    } else if (typeof item?.price === 'string') {
      const priceMatch = item.price.match(/(\d+)/);
      priceVal = priceMatch ? parseInt(priceMatch[0]) : 0;
    }
    const extras = item?.extraSaucePrice || 0;
    const addOnsTotal = (Array.isArray(item?.addOns) ? item.addOns : []).reduce((sum, addOn) => sum + (Number(addOn?.price) || 0), 0);
    return total + ((priceVal + extras + addOnsTotal) * (item?.quantity || 1));
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateCartItem, clearCart, cartTotal, isCheckoutOpen, openCheckout, closeCheckout }}>
      {children}
    </CartContext.Provider>
  );
};
