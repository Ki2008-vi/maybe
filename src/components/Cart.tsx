import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Cart = () => {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    // Generate WhatsApp message
    let message = 'Hello! I would like to order:\n\n';
    cartItems.forEach(item => {
      message += `- ${item.name} (Qty: ${item.quantity}) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
    });
    message += `\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}\n\n`;
    message += 'Please let me know the payment details. Thank you!';
    
    // Encode for URL
    const encodedMessage = encodeURIComponent(message);
    // Replace with actual WhatsApp number
    const whatsappNumber = '6281234567890'; 
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-lg font-bold tracking-widest uppercase flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p className="font-display text-sm tracking-widest uppercase">Your cart is empty</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 border-b border-black text-black pb-1 text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <Link to={`/product/${item.id}`} onClick={() => setIsCartOpen(false)} className="w-24 h-32 shrink-0 bg-gray-100">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${item.id}`} onClick={() => setIsCartOpen(false)}>
                          <h3 className="font-display text-sm font-bold tracking-widest uppercase hover:underline">{item.name}</h3>
                        </Link>
                        <p className="text-xs text-gray-500 tracking-widest uppercase mt-1">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold tracking-widest uppercase">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4 bg-white">
            <div className="flex justify-between items-center text-sm font-bold tracking-widest uppercase">
              <span>Subtotal</span>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Shipping & taxes calculated at checkout</p>
            <button 
              onClick={handleCheckout}
              className="w-full bg-black text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors"
            >
              Checkout via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
};
