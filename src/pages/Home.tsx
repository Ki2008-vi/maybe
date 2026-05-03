import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';

export const Home = () => {
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Banner" 
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
            className="font-display text-5xl md:text-8xl font-bold tracking-[0.1em] uppercase mb-12"
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

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-12 text-white/50 text-[10px] font-bold tracking-[0.4em] uppercase">
          <span>01 / BLEACH</span>
          <span>02 / RAYA 26</span>
          <span>03 / CAPSULE</span>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32 max-w-[1400px] mx-auto px-6 w-full">
        <div className="flex items-end justify-between mb-20">
          <div className="space-y-4">
            <span className="font-display text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">Featured items</span>
            <h2 className="font-display text-4xl font-bold uppercase tracking-widest">New Arrivals</h2>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Split */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-square md:aspect-auto h-[600px] overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=1200&auto=format&fit=crop" 
            alt="Editorial" 
            className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
          <div className="absolute inset-0 flex items-center justify-center p-12 text-center text-white">
            <div className="space-y-6">
              <h3 className="font-display text-3xl font-bold uppercase tracking-widest">Lookbooks</h3>
              <p className="text-sm font-medium uppercase tracking-widest opacity-80">Explore our seasonal editorials</p>
              <Link to="/lookbook" className="inline-block border-b border-white pb-1 text-[10px] font-bold uppercase tracking-[0.3em]">Explore</Link>
            </div>
          </div>
        </div>
        <div className="relative aspect-square md:aspect-auto h-[600px] overflow-hidden group bg-gray-50 flex items-center justify-center p-12 lg:p-32">
          <div className="space-y-8 text-center">
            <span className="font-display text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">Newsletter</span>
            <h3 className="font-display text-4xl font-bold uppercase tracking-widest leading-tight">Be part of the SNSB world</h3>
            <p className="text-gray-500 text-sm uppercase tracking-[0.2em] leading-relaxed">
              Sign up for early access to limited edition drops, secret collaborations, and worldwide events.
            </p>
            <div className="pt-4">
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS" 
                className="w-full max-w-sm bg-transparent border-b border-black py-4 text-[10px] tracking-widest uppercase text-center focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
