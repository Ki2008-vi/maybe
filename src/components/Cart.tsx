import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronDown, CheckCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SIZE_OPTIONS = {
  default: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
  accessories: ['One Size'],
};

const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'E-Wallet', 'COD'];

const getSizeOptions = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('shoe') || cat.includes('footwear') || cat.includes('sandal')) return SIZE_OPTIONS.shoes;
  if (cat.includes('bag') || cat.includes('hat') || cat.includes('accessory') || cat.includes('accessories')) return SIZE_OPTIONS.accessories;
  return SIZE_OPTIONS.default;
};

const SizeSelector = ({ item, onSizeChange }) => {
  const [open, setOpen] = useState(false);
  const sizes = getSizeOptions(item.category);
  const selectedSize = item.size || '';

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 border text-xs uppercase tracking-widest font-bold px-3 py-1.5 transition-colors w-full justify-between ${
          !selectedSize ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-gray-700 hover:border-black'
        }`}
      >
        <span>{selectedSize ? `Size: ${selectedSize}` : '— Select Size —'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 shadow-lg mt-0.5 max-h-48 overflow-y-auto">
          {sizes.map(size => (
            <button key={size} onClick={() => { onSizeChange(item.id, size); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs uppercase tracking-widest font-bold transition-colors ${
                selectedSize === size ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-700'
              }`}>
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Cart = () => {
  const { user } = useAuth();
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, updateSize, totalPrice, clearCart } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State untuk metode pembayaran
  const [paymentMethod, setPaymentMethod] = useState('');

  if (!isCartOpen) return null;

  const missingSize = cartItems.some(item => !item.size);
  const missingPayment = !paymentMethod; // Validasi pembayaran

  const handleCheckout = async () => {
    if (missingSize || missingPayment || placing) return;
    setPlacing(true);
    setErrorMsg('');

    const newOrderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newOrderId,
          userId: user?.uid || null,
          customerName: user?.displayName || 'Guest',
          customerEmail: user?.email || 'guest@example.com',
          total: totalPrice,
          paymentMethod: paymentMethod, // Mengirimkan metode pembayaran
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to place order');

      setOrderId(newOrderId);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to place order. Please check your connection and try again.');
    } finally {
      setPlacing(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset after closing so next open starts fresh
    setTimeout(() => {
      setOrderPlaced(false);
      setOrderId('');
      setErrorMsg('');
      setPaymentMethod(''); // Reset metode pembayaran
    }, 300);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={handleClose} />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-lg font-bold tracking-widest uppercase flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {orderPlaced ? 'Order Confirmed' : 'Your Cart'}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── ORDER SUCCESS SCREEN ── */}
        {orderPlaced ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold uppercase tracking-widest mb-2">Thank You!</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Your order has been placed successfully</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 px-6 py-4 w-full">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
              <p className="font-display text-lg font-bold tracking-widest">{orderId}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 px-6 py-4 w-full">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
              <p className="font-display text-sm font-bold tracking-widest uppercase">{paymentMethod}</p>
            </div>
            <div className="space-y-2 w-full">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                Your order is now in the admin panel. We will contact you shortly to confirm your order and payment details.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ── CART ITEMS ── */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p className="font-display text-sm tracking-widest uppercase">Your cart is empty</p>
                  <button onClick={handleClose}
                    className="mt-4 border-b border-black text-black pb-1 text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <Link to={`/product/${item.id}`} onClick={handleClose} className="w-24 h-36 shrink-0 bg-gray-100">
                        <img
                          src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1594932224828-b4b059b6fe1c?q=80&w=1000&auto=format&fit=crop'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <Link to={`/product/${item.id}`} onClick={handleClose}>
                              <h3 className="font-display text-sm font-bold tracking-widest uppercase hover:underline truncate">{item.name}</h3>
                            </Link>
                            <p className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">{item.category}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <SizeSelector item={item} onSizeChange={(id, size) => updateSize(id, size)} />
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center border border-gray-200">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-50 transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 text-xs font-bold border-x border-gray-200">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-50 transition-colors">
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

            {/* ── FOOTER ── */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 p-6 space-y-4 bg-white">
                
                {/* ── PAYMENT METHOD SELECTION ── */}
                <div className="space-y-2 mb-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Select Payment Method</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2.5 px-2 text-[10px] font-bold uppercase tracking-widest border transition-colors flex items-center justify-center ${
                          paymentMethod === method 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {missingSize && (
                  <p className="text-xs text-red-500 uppercase tracking-widest font-bold text-center">
                    ⚠ Please select a size for all items
                  </p>
                )}
                {missingPayment && !missingSize && (
                  <p className="text-xs text-red-500 uppercase tracking-widest font-bold text-center">
                    ⚠ Please select a payment method
                  </p>
                )}
                {errorMsg && (
                  <p className="text-xs text-red-500 uppercase tracking-widest font-bold text-center">{errorMsg}</p>
                )}

                <div className="flex justify-between items-center text-sm font-bold tracking-widest uppercase">
                  <span>Subtotal</span>
                  <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Shipping &amp; taxes calculated upon confirmation
                </p>
                
                <button
                  onClick={handleCheckout}
                  disabled={missingSize || missingPayment || placing}
                  className={`w-full py-4 text-xs font-bold tracking-widest uppercase transition-colors ${
                    missingSize || missingPayment || placing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  {placing ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};