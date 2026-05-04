import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, ChevronDown, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

import { useSettings } from '../context/SettingsContext';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { setIsCartOpen, totalItems } = useCart();
  const { user, isAdmin } = useAuth();
  const { storeTitle, storeImage } = useSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
  }, [location, setIsCartOpen]);

  // Split store title into two parts for the aesthetic
  const titleParts = storeTitle.split(' ');
  const mainTitle = titleParts[0] || 'SNSB';
  const subTitle = titleParts.slice(1).join(' ') || 'WORLD';

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
            {storeImage ? (
              <img src={storeImage} alt={storeTitle} className="h-8 md:h-12 w-auto object-contain" />
            ) : (
              <>
                <span className="font-display text-2xl font-bold tracking-[0.2em] uppercase">{mainTitle}</span>
                <span className="text-[10px] tracking-[0.4em] uppercase -mt-1 opacity-60">{subTitle}</span>
              </>
            )}
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-50 transition-opacity">
              <Search className="w-5 h-5" />
            </button>
            <div className="hidden sm:block relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="hover:opacity-50 transition-opacity flex items-center gap-2"
              >
                {user ? (
                  <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-5 h-5 rounded-full" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
              
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute top-full right-0 pt-4 z-50">
                    <div className="bg-white border border-gray-100 shadow-xl p-4 min-w-[200px]">
                      {user ? (
                        <div className="space-y-3">
                          <div className="pb-3 border-b border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                            <p className="text-xs font-bold truncate">{user.displayName}</p>
                            <p className="text-[9px] text-gray-500 truncate">{user.email}</p>
                          </div>
                          {isAdmin ? (
                            <Link to="/admin" className="block text-xs font-bold uppercase tracking-widest hover:pl-2 transition-all text-red-500">Admin Panel</Link>
                          ) : (
                            <p className="text-[9px] text-red-400 italic">No Admin Access</p>
                          )}
                          <button 
                            onClick={() => {
                              signOut(auth);
                              setIsUserMenuOpen(false);
                            }}
                            className="block w-full text-left text-xs font-bold uppercase tracking-widest hover:pl-2 transition-all"
                          >
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            signInWithGoogle();
                            setIsUserMenuOpen(false);
                          }}
                          className="block w-full text-left text-xs font-bold uppercase tracking-widest hover:pl-2 transition-all"
                        >
                          Login / Sign Up
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
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
                <span className="font-display text-xl font-bold tracking-[0.2em] uppercase">{storeTitle}</span>
              </Link>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 space-y-8 font-display text-2xl font-bold uppercase tracking-widest overflow-y-auto">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block">Home</Link>
              <div className="space-y-4">
                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="block">Shop</Link>
                <div className="pl-4 space-y-3 text-lg text-gray-500">
                  <Link to="/shop?cat=New Arrival" onClick={() => setIsMenuOpen(false)} className="block hover:text-black">New Arrival</Link>
                  <Link to="/shop?cat=T-Shirt" onClick={() => setIsMenuOpen(false)} className="block hover:text-black">T-Shirts</Link>
                  <Link to="/shop?cat=Pants" onClick={() => setIsMenuOpen(false)} className="block hover:text-black">Pants</Link>
                  <Link to="/shop?cat=Outwear" onClick={() => setIsMenuOpen(false)} className="block hover:text-black">Outwear</Link>
                  <Link to="/shop?cat=Accessories" onClick={() => setIsMenuOpen(false)} className="block hover:text-black">Accessories</Link>
                </div>
              </div>
              <Link to="/lookbook" onClick={() => setIsMenuOpen(false)} className="block">Lookbooks</Link>
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-red-500">Admin Panel</Link>
                  )}
                  <button 
                    onClick={() => {
                      signOut(auth);
                      setIsMenuOpen(false);
                    }}
                    className="block text-left w-full text-2xl font-bold uppercase tracking-widest"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    signInWithGoogle();
                    setIsMenuOpen(false);
                  }}
                  className="block text-left w-full text-2xl font-bold uppercase tracking-widest"
                >
                  Login
                </button>
              )}
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
