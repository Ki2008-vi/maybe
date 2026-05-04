import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { Minus, Plus, ArrowLeft, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      setActiveImageIndex(0);
      setQuantity(1);

      let foundProduct: any = null;
      let allProducts: any[] = [];

      // Try local constants first
      const localProduct = PRODUCTS.find(p => p.id === id);
      if (localProduct) {
        foundProduct = localProduct;
        // Also fetch API products for related
        try {
          const res = await fetch(`${API_URL}/api/products`);
          const data = await res.json();
          allProducts = Array.isArray(data) ? data.map(p => ({ ...p, price: Number(p.price), images: p.images || [] })) : [];
        } catch { /* silent */ }
      } else {
        // Fetch from API
        try {
          const res = await fetch(`${API_URL}/api/products`);
          const data = await res.json();
          allProducts = Array.isArray(data) ? data.map(p => ({ ...p, price: Number(p.price), images: p.images || [] })) : [];
          foundProduct = allProducts.find(p => String(p.id) === id) || null;
        } catch (err) {
          console.error('Error fetching product:', err);
        }
      }

      setProduct(foundProduct);

      // Build related products: same category, exclude current, max 4
      if (foundProduct) {
        const sameCategory = [
          ...PRODUCTS.filter(p => p.category === foundProduct.category && String(p.id) !== id),
          ...allProducts.filter(p => p.category === foundProduct.category && String(p.id) !== id),
        ];
        // Deduplicate by id
        const seen = new Set<string>();
        const deduped = sameCategory.filter(p => {
          if (seen.has(String(p.id))) return false;
          seen.add(String(p.id));
          return true;
        });
        setRelatedProducts(deduped.slice(0, 4));
      }

      setLoading(false);
    };

    getProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center px-6 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center px-6 min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-widest mb-4">Product Not Found</h1>
        <button onClick={() => navigate('/shop')}
          className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-50">
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.status === 'In Stock') addToCart(product, quantity);
  };

  const fallbackImg = 'https://images.unsplash.com/photo-1594932224828-b4b059b6fe1c?q=80&w=1000&auto=format&fit=crop';

  return (
    <div className="pt-32 pb-24 max-w-[1400px] mx-auto px-6 w-full animate-in fade-in duration-500">
      {/* Back button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity mb-12">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Main product layout */}
      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        {/* Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="aspect-square md:aspect-[4/5] bg-gray-100 overflow-hidden">
            <img
              src={product.images?.[activeImageIndex] || fallbackImg}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImageIndex(idx)}
                  className={`w-24 h-32 shrink-0 bg-gray-100 border-2 transition-all ${
                    activeImageIndex === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                  }`}>
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{product.category}</p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-[0.2em] mb-6">{product.name}</h1>
          <p className="text-xl font-medium tracking-widest uppercase mb-4">
            Rp {product.price.toLocaleString('id-ID')}
          </p>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold">{product.rating || '0.0'}</span>
            </div>
            <div className="w-[1px] h-4 bg-gray-300" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              {product.soldCount || 0} Terjual
            </span>
          </div>
          <div className="prose prose-sm text-gray-600 mb-12">
            <p>{product.description || 'Premium quality garment crafted with attention to detail. Designed for comfort and durability while maintaining a sleek, modern aesthetic.'}</p>
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
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 hover:bg-gray-50 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-4 hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button onClick={handleAddToCart} disabled={product.status !== 'In Stock'}
              className={`w-full py-5 text-sm font-bold tracking-[0.2em] uppercase transition-all mt-8 ${
                product.status === 'In Stock'
                  ? 'bg-black text-white hover:bg-gray-900'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
              {product.status === 'In Stock' ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-gray-100">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-2">You May Also Like</p>
              <h2 className="font-display text-2xl font-bold uppercase tracking-[0.2em]">Related Products</h2>
            </div>
            <Link to={`/shop?cat=${encodeURIComponent(product.category)}`}
              className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity hidden sm:block">
              View All {product.category}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(related => (
              <Link key={related.id} to={`/product/${related.id}`}
                className="group flex flex-col cursor-pointer">
                {/* Image */}
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4 relative">
                  <img
                    src={related.images?.[0] || fallbackImg}
                    alt={related.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={e => { (e.target as HTMLImageElement).src = fallbackImg; }}
                  />
                  {related.status === 'Sold Out' && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sold Out</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{related.category}</p>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest mb-2 group-hover:opacity-60 transition-opacity line-clamp-2">
                  {related.name}
                </h3>
                <p className="text-xs font-medium tracking-widest uppercase mt-auto">
                  Rp {Number(related.price).toLocaleString('id-ID')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};