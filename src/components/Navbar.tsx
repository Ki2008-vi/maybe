import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, ChevronDown, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { setIsCartOpen, totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsCartOpen(false);
  }, [location, setIsCartOpen]);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white border-b border-gray-100 py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Left Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-8 font-display text-[13px] font-medium tracking-widest uppercase">
            <Link to="/" className="hover:opacity-50 transition-opacity">Home</Link>
            <div className="group relative">
              <Link to="/shop" className="flex items-center gap-1 hover:opacity-50 transition-opacity">
                Shop <ChevronDown className="w-3 h-3" />
              </Link>
              {/* Simple Mega Menu */}
              <div className="absolute top-full left-0 pt-4 hidden group-hover:block transition-all opacity-0 group-hover:opacity-100">
                <div className="bg-white border border-gray-100 shadow-xl p-6 min-w-[200px]">
                  <ul className="space-y-3">
                    <li><Link to="/shop?cat=New Arrival" className="hover:pl-2 transition-all block">New Arrival</Link></li>
                    <li><Link to="/shop?cat=T-Shirt" className="hover:pl-2 transition-all block">T-Shirts</Link></li>
                    <li><Link to="/shop?cat=Pants" className="hover:pl-2 transition-all block">Pants</Link></li>
                    <li><Link to="/shop?cat=Outwear" className="hover:pl-2 transition-all block">Outwear</Link></li>
                    <li><Link to="/shop?cat=Accessories" className="hover:pl-2 transition-all block">Accessories</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <Link to="/lookbook" className="hover:opacity-50 transition-opacity">Lookbooks</Link>
          </div>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="font-display text-2xl font-bold tracking-[0.2em] uppercase">SNSB</span>
            <span className="text-[10px] tracking-[0.4em] uppercase -mt-1 opacity-60">World</span>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-50 transition-opacity">
              <Search className="w-5 h-5" />
            </button>
            <button className="hidden sm:block hover:opacity-50 transition-opacity">
              <User className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative hover:opacity-50 transition-opacity"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>


      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 bg-white z-[100] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <span className="font-display text-xl font-bold tracking-[0.2em] uppercase">SNSB WORLD</span>
              </Link>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 space-y-8 font-display text-2xl font-bold uppercase tracking-widest">
              <Link to="/" className="block">Home</Link>
              <Link to="/shop" className="block">Shop All</Link>
              <Link to="/lookbook" className="block">Lookbooks</Link>
              <Link to="/account" className="block text-gray-300">Account</Link>
            </div>

            <div className="pt-8 border-t border-gray-100 flex gap-6 grayscale opacity-60">
              <span className="text-xs font-bold uppercase tracking-widest">IG</span>
              <span className="text-xs font-bold uppercase tracking-widest">FB</span>
              <span className="text-xs font-bold uppercase tracking-widest">TW</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
