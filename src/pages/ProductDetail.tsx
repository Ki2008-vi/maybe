import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { Minus, Plus, ArrowLeft } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      // Try local constants first
      const localProduct = PRODUCTS.find(p => p.id === id);
      if (localProduct) {
        setProduct(localProduct);
        setLoading(false);
        return;
      }

      // If not found, try API
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        const found = data.find((p: any) => String(p.id) === id);
        if (found) {
          setProduct({
            ...found,
            price: Number(found.price),
            images: found.images || []
          });
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    getProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center px-6 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center px-6 min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-widest mb-4">Product Not Found</h1>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-50"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.status === 'In Stock') {
      addToCart(product, quantity);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-[1400px] mx-auto px-6 w-full animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity mb-12"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        {/* Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
            <img 
              src={product.images && product.images[activeImageIndex] ? product.images[activeImageIndex] : 'https://images.unsplash.com/photo-1594932224828-b4b059b6fe1c?q=80&w=1000&auto=format&fit=crop'} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images && product.images.length > 0 && product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-24 h-32 shrink-0 bg-gray-100 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{product.category}</p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-[0.2em] mb-6">
            {product.name}
          </h1>
          <p className="text-xl font-medium tracking-widest uppercase mb-8">
            Rp {product.price.toLocaleString('id-ID')}
          </p>

          <div className="prose prose-sm text-gray-600 mb-12">
            <p>
              {product.description || 'Premium quality garment crafted with attention to detail. Designed for comfort and durability while maintaining a sleek, modern aesthetic.'}
            </p>
          </div>

          <div className="space-y-6 mt-auto">
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold uppercase tracking-widest w-24">Status</span>
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 ${
                product.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.status}
              </span>
            </div>

            {product.status === 'In Stock' && (
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold uppercase tracking-widest w-24">Quantity</span>
                <div className="flex items-center border border-gray-200">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button 
              onClick={handleAddToCart}
              disabled={product.status === 'Sold Out'}
              className={`w-full py-5 text-sm font-bold tracking-[0.2em] uppercase transition-all mt-8 ${
                product.status === 'In Stock' 
                  ? 'bg-black text-white hover:bg-gray-900' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {product.status === 'In Stock' ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
