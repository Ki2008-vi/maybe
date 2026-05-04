import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  return (
    <div 
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-gray-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img 
            src={isHovered && product.images && product.images[1] ? product.images[1] : (product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1594932224828-b4b059b6fe1c?q=80&w=1000&auto=format&fit=crop')} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        
        {product.status === 'Sold Out' && (
          <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm pointer-events-none">
            Sold Out
          </div>
        )}

        <div className="absolute bottom-4 right-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity translate-y-0 lg:translate-y-2 group-hover:translate-y-0 duration-300 z-10">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.status === 'In Stock') {
                addToCart(product);
              }
            }}
            disabled={product.status === 'Sold Out'}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg ${
              product.status === 'In Stock' 
                ? 'bg-black text-white hover:bg-gray-900' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.status === 'In Stock' ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col items-center">
        <h3 className="font-display text-[12px] font-bold tracking-widest uppercase mb-1">{product.name}</h3>
        <p className="text-[11px] font-medium text-gray-500 tracking-widest uppercase mb-2">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold text-gray-700">{product.rating || '0.0'}</span>
          </div>
          <div className="w-[1px] h-3 bg-gray-300" />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">
            {product.soldCount || 0} Terjual
          </span>
        </div>
      </div>
    </div>
  );
};
