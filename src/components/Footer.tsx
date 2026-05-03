import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <span className="font-display text-2xl font-bold tracking-[0.2em] uppercase">SNSB WORLD</span>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Southeast Asian streetwear brand selling curated collections and anime-inspired drops.
            </p>
          </div>
          
          <div>
            <h4 className="font-display text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500 mb-6">Explore</h4>
            <ul className="space-y-4 text-xs font-medium uppercase tracking-widest">
              <li><Link to="/shop" className="hover:text-gray-400 transition-colors">Shop All</Link></li>
              <li><Link to="/lookbook" className="hover:text-gray-400 transition-colors">Lookbook</Link></li>
              <li><Link to="/about" className="hover:text-gray-400 transition-colors">Our Story</Link></li>
              <li><Link to="/stockist" className="hover:text-gray-400 transition-colors">Stockists</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500 mb-6">Service</h4>
            <ul className="space-y-4 text-xs font-medium uppercase tracking-widest">
              <li><Link to="/shipping" className="hover:text-gray-400 transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="hover:text-gray-400 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-gray-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500 mb-6">Newsletter</h4>
            <p className="text-gray-400 text-xs mb-6 uppercase tracking-widest leading-loose">
              Join the club for early access to drops.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent border-b border-gray-700 py-2 flex-1 text-[10px] tracking-widest uppercase focus:outline-none focus:border-white transition-colors"
              />
              <button className="text-[10px] font-bold uppercase tracking-[0.3em] hover:opacity-50">Join</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/10 text-[10px] tracking-[0.2em] font-medium text-gray-600 uppercase">
          <p>© {new Date().getFullYear()} SNSB WORLD. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6 mt-6 md:mt-0">
            <Instagram className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
            <Facebook className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
            <Twitter className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
};
