import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export const Shop = () => {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  
  const [sortBy, setSortBy] = useState('Best Selling');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(1000000);

  const categories = ['All Product', 'T-Shirt', 'Pants', 'Outwear', 'Accessories', 'Long Sleeve'];

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];
    
    if (catParam && catParam !== 'All Product') {
      result = result.filter(p => p.category === catParam);
    }

    result = result.filter(p => p.price <= priceRange);

    if (sortBy === 'Price: Low to High') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'Price: High to Low') result.sort((a, b) => b.price - a.price);

    return result;
  }, [catParam, priceRange, sortBy]);

  return (
    <div className="pt-32 pb-24 max-w-[1400px] mx-auto px-6 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <h1 className="font-display text-5xl font-bold uppercase tracking-[0.2em] mb-4">
            {catParam || 'All Product'}
          </h1>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">
            {filteredProducts.length} items found
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-black md:border-none pb-2 md:pb-0">
              Sort: {sortBy} <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full right-0 pt-4 hidden group-hover:block z-20">
              <div className="bg-white border border-gray-100 shadow-xl p-4 min-w-[200px] text-xs font-bold uppercase tracking-widest space-y-3 cursor-pointer">
                {['Best Selling', 'Price: Low to High', 'Price: High to Low', 'A-Z', 'Date: New to Old'].map(opt => (
                  <div key={opt} onClick={() => setSortBy(opt)} className="hover:opacity-50">{opt}</div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-2"
          >
            <SlidersHorizontal className="w-3 h-3" /> Filter
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 space-y-12 shrink-0 animate-in fade-in slide-in-from-left-4 duration-300`}>
          <div>
            <h4 className="font-display text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-6">Categories</h4>
            <div className="space-y-3 text-xs font-bold uppercase tracking-widest">
              {categories.map(cat => (
                <Link 
                  key={cat} 
                  to={cat === 'All Product' ? '/shop' : `/shop?cat=${cat}`}
                  className={`block transition-all hover:pl-2 ${catParam === cat || (!catParam && cat === 'All Product') ? 'text-black' : 'text-gray-400'}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-6">Price Range</h4>
            <input 
              type="range" 
              min="0" 
              max="1000000" 
              step="50000"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>Rp 0</span>
              <span>Rp {priceRange.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-6">Availability</h4>
            <div className="space-y-3 text-xs font-bold uppercase tracking-widest">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-black border-2 rounded-none accent-black" />
                <span>In Stock</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer opacity-40">
                <input type="checkbox" checked disabled className="w-4 h-4 border-black border-2 rounded-none accent-black" />
                <span>Sold Out</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-32 text-center">
              <p className="font-display text-gray-400 uppercase tracking-widest text-sm">No products found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { Link } from 'react-router-dom';
