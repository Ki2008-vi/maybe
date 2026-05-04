import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronDown, CheckCircle, CreditCard, MapPin, User, Phone, Receipt } from 'lucide-react';
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
        className={`flex items-center gap-2 border text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 transition-colors w-full justify-between ${
          !selectedSize ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-gray-700 hover:border-black'
        }`}
      >
        <span>{selectedSize ? `Size: ${selectedSize}` : '— Select Size —'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 shadow-lg mt-0.5 max-h-40 overflow-y-auto">
          {sizes.map(size => (
            <button key={size} onClick={() => { onSizeChange(item.id, size); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${
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
  
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // State kompleks untuk form pengiriman
  const [shippingForm, setShippingForm] = useState({
    recipientName: '',
    phone: '',
    streetAddress: '',
    city: '',
    postalCode: ''
  });

  // Isi otomatis nama jika user login
  useEffect(() => {
    if (user?.displayName && !shippingForm.recipientName) {
      setShippingForm(prev => ({ ...prev, recipientName: user.displayName }));
    }
  }, [user]);

  if (!isCartOpen) return null;

  // Kalkulasi Harga
  const grandTotal = totalPrice;

  // Validasi
  const missingSize = cartItems.some(item => !item.size);
  const missingPayment = !paymentMethod;
  const isShippingValid = Object.values(shippingForm).every(val => val.trim() !== '');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (missingSize || missingPayment || !isShippingValid || placing) return;
    setPlacing(true);
    setErrorMsg('');

    const newOrderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
      const payload = {
        id: newOrderId,
        userId: user?.uid || null,
        customerEmail: user?.email || 'guest@example.com',
        shippingDetails: shippingForm,
        financials: {
          subTotal: totalPrice,
          tax: 0,
          shippingFee: 0,
          grandTotal: grandTotal,
        },
        paymentMethod: paymentMethod,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to place order');

      setOrderId(newOrderId);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setErrorMsg('Transaction failed. Please verify your connection or try another payment method.');
    } finally {
      setPlacing(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      if (orderPlaced) {
        setOrderPlaced(false);
        setOrderId('');
        setPaymentMethod('');
        setShippingForm({ recipientName: user?.displayName || '', phone: '', streetAddress: '', city: '', postalCode: '' });
      }
      setErrorMsg('');
    }, 300);
  };

  const inputClass = "w-full border border-gray-200 p-2 text-[11px] uppercase tracking-wider focus:border-black outline-none bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={handleClose} />

      <div className="fixed inset-y-0 right-0 w-[85%] sm:w-[400px] md:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 bg-white z-10 shrink-0">
          <h2 className="font-display text-sm md:text-lg font-bold tracking-widest uppercase flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            {orderPlaced ? 'Order Confirmed' : 'Checkout'}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderPlaced ? (
          <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
            <div className="flex flex-col items-center justify-center text-center py-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-widest mb-1">Payment Success!</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Your order is being processed.</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Order Reference</p>
                <p className="font-display text-sm font-bold tracking-widest">{orderId}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Delivery Info</p>
                  <p className="text-xs font-bold uppercase tracking-wider">{shippingForm.recipientName} ({shippingForm.phone})</p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-600 mt-1 leading-relaxed">
                    {shippingForm.streetAddress}, {shippingForm.city}, {shippingForm.postalCode}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Paid via</p>
                  <p className="font-display text-xs font-bold tracking-widest uppercase">{paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="font-display text-sm font-bold tracking-widest">Rp {grandTotal.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button onClick={handleClose} className="w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── SCROLLABLE CONTENT ── */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 p-6">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="font-display text-sm tracking-widest uppercase">Your cart is empty</p>
                </div>
              ) : (
                <div className="p-4 md:p-6 space-y-6 md:space-y-8">
                  {/* Cart Items Section */}
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">1. Order Items</h3>
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-4 bg-white">
                        <Link to={`/product/${item.id}`} onClick={handleClose} className="w-20 h-28 shrink-0 bg-gray-100">
                          <img src={item.images?.[0] || ''} alt={item.name} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1 flex flex-col min-w-0 py-1">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="font-display text-xs font-bold tracking-widest uppercase truncate">{item.name}</h3>
                              <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="mt-auto space-y-2">
                            <SizeSelector item={item} onSizeChange={(id, size) => updateSize(id, size)} />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-gray-200">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50 text-gray-600"><Minus className="w-3 h-3" /></button>
                                <span className="px-3 py-1 text-[10px] font-bold border-x border-gray-200">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50 text-gray-600"><Plus className="w-3 h-3" /></button>
                              </div>
                              <p className="text-xs font-bold tracking-widest uppercase">
                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Form Section */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">2. Shipping Details</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                          <input type="text" name="recipientName" value={shippingForm.recipientName} onChange={handleInputChange} placeholder="Full Name" className={`${inputClass} pl-9`} />
                        </div>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                          <input type="tel" name="phone" value={shippingForm.phone} onChange={handleInputChange} placeholder="Phone Number" className={`${inputClass} pl-9`} />
                        </div>
                      </div>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                        <textarea name="streetAddress" value={shippingForm.streetAddress} onChange={handleInputChange} placeholder="Street Address, Appt/Suite" rows={2} className={`${inputClass} pl-9 resize-none`} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="city" value={shippingForm.city} onChange={handleInputChange} placeholder="City / District" className={inputClass} />
                        <input type="text" name="postalCode" value={shippingForm.postalCode} onChange={handleInputChange} placeholder="Postal Code" className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div className="space-y-4 pb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">3. Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-3 px-2 text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                            paymentMethod === method 
                              ? 'bg-black text-white border-black shadow-md' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                          }`}
                        >
                          {method === 'Credit Card' && <CreditCard className="w-3.5 h-3.5" />}
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── FIXED BOTTOM FOOTER ── */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 md:p-6 shrink-0">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm font-bold tracking-widest uppercase border-t border-gray-200 pt-4 mt-2">
                    <span className="flex items-center gap-2"><Receipt className="w-4 h-4"/> Total</span>
                    <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Validation Warnings */}
                <div className="mb-4 space-y-1">
                  {missingSize && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold text-center">⚠ Size required for all items</p>}
                  {!isShippingValid && !missingSize && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold text-center">⚠ Complete shipping details required</p>}
                  {missingPayment && isShippingValid && !missingSize && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold text-center">⚠ Select a payment method</p>}
                  {errorMsg && <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold text-center">{errorMsg}</p>}
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={missingSize || missingPayment || !isShippingValid || placing}
                  className={`w-full py-4 text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                    missingSize || missingPayment || !isShippingValid || placing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-900 hover:shadow-lg'
                  }`}
                >
                  {placing ? 'Processing Securely...' : 'Pay & Place Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};