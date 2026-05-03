import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img 
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {product.status === 'Sold Out' && (
          <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Sold Out
          </div>
        )}

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-10">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.status === 'In Stock') {
                addToCart(product);
              }
            }}
            disabled={product.status === 'Sold Out'}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${
              product.status === 'In Stock' 
                ? 'bg-black text-white hover:bg-gray-900' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.status === 'In Stock' ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </Link>
      
      <div className="mt-4 flex flex-col items-center">
        <h3 className="font-display text-[12px] font-bold tracking-widest uppercase mb-1">{product.name}</h3>
        <p className="text-[11px] font-medium text-gray-500 tracking-widest uppercase">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
};
