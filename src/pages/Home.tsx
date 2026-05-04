import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';

export const Home = () => {
  const featuredProducts = PRODUCTS.slice(0, 4);
  const { settings } = useSettings();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={settings.storeImage || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop"} 
            alt={settings.storeTitle} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center px-6 text-white">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-[12px] font-bold tracking-[0.6em] uppercase mb-6"
          >
            New Collection
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl md:text-8xl font-bold tracking-[0.1em] uppercase mb-12"
          >
            SNSB X BLEACH
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              to="/shop" 
              className="inline-block border-2 border-white px-12 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
            >
              Shop Collection
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-wrap justify-center w-full px-4 gap-4 md:gap-12 text-white/50 text-[10px] font-bold tracking-[0.4em] uppercase">
          <span>01 / BLEACH</span>
          <span>02 / RAYA 26</span>
          <span>03 / CAPSULE</span>
        </div>
      </section>
    </div>
  );
};
