import React from 'react';
import { motion } from 'motion/react';
import { LOOKBOOKS } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Lookbook = () => {
  return (
    <div className="pt-24 min-h-screen bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="mb-24 space-y-6 text-center max-w-2xl mx-auto">
          <span className="font-display text-[10px] font-bold tracking-[0.6em] uppercase text-gray-500">Editorial Archive</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-[0.1em]">Lookbooks</h1>
          <p className="text-gray-400 text-sm uppercase tracking-[0.2em] leading-relaxed">
            A visual documentation of the SNSB WORLD universe through styled photography and artistic direction.
          </p>
        </div>

        <div className="space-y-40">
          {LOOKBOOKS.map((lb, index) => (
            <section key={lb.id} className="relative">
              <div className="flex flex-col lg:flex-row gap-12 items-center mb-16 px-4">
                <div className="lg:w-1/3 space-y-6">
                  <span className="font-display text-8xl font-bold text-white/5 absolute -top-20 -left-10 select-none">{lb.year}</span>
                  <div className="relative">
                    <h2 className="font-display text-4xl font-bold uppercase tracking-widest leading-tight">{lb.title}</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] mt-2">{lb.year} Collection</p>
                  </div>
                  <p className="text-gray-400 text-sm uppercase tracking-[0.15em] leading-loose">
                    {lb.description}
                  </p>
                </div>

                <div className="lg:flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lb.images.map((img, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className={`overflow-hidden group ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                    >
                      <img 
                        src={img} 
                        alt={`${lb.title} - ${i + 1}`} 
                        className="w-full aspect-[3/4] object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Optional Carousel Indication */}
              <div className="h-px bg-white/10 w-full" />
            </section>
          ))}
        </div>

        <div className="mt-40 text-center py-40 border-t border-white/5 bg-gray-900/20">
          <p className="font-display text-[10px] font-bold tracking-[0.6em] uppercase text-gray-600 mb-8">End of archives</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-px h-24 bg-gradient-to-b from-white/20 to-transparent mx-auto"
          />
        </div>
      </div>
    </div>
  );
};
