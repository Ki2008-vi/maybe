import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Package, Plus, Trash2, Edit2, X, Upload, CheckSquare, Square, ImageOff, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: string;
  description: string;
  images: string[];
  paymentMethods?: string[]; // Ditambahkan untuk metode pembayaran
}

const EMPTY_FORM = {
  name: '',
  category: 'T-Shirt',
  price: '',
  status: 'In Stock',
  description: '',
  paymentMethods: [] as string[], // Default state untuk metode pembayaran
};

const AVAILABLE_PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'E-Wallet', 'COD'];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  // Tab 'settings' ditambahkan ke dalam state
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Image upload state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const { refreshSettings } = useSettings();

  // Store Settings State
  const [storeTitle, setStoreTitle] = useState('My Store');
  const [storeImagePreview, setStoreImagePreview] = useState<string>('');
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const storeImageInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch { setOrders([]); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch { setProducts([]); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      const data = await res.json();
      if (data.storeTitle) setStoreTitle(data.storeTitle);
      if (data.storeImage) setStoreImagePreview(data.storeImage);
    } catch { /* Ignore if settings endpoint doesn't exist yet */ }
  };

  useEffect(() => {
    const load = async () => {
      if (!isAdmin) return;
      setLoading(true);
      if (activeTab === 'orders') await fetchOrders();
      else if (activeTab === 'products') await fetchProducts();
      else if (activeTab === 'settings') await fetchSettings();
      setLoading(false);
    };
    if (!authLoading && isAdmin) load();
  }, [isAdmin, authLoading, activeTab]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      status: product.status,
      description: product.description || '',
      paymentMethods: product.paymentMethods || [],
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(product.images || []);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setErrorMsg('');
  };

  // ── Handlers untuk Metode Pembayaran ────────────────────────────────────────
  const togglePaymentMethod = (method: string) => {
    setForm(prev => {
      const isSelected = prev.paymentMethods.includes(method);
      if (isSelected) {
        return { ...prev, paymentMethods: prev.paymentMethods.filter(m => m !== method) };
      } else {
        return { ...prev, paymentMethods: [...prev.paymentMethods, method] };
      }
    });
  };

  // ── Handlers untuk Store Settings ───────────────────────────────────────────
  const handleStoreImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File is larger than 5MB.');
      return;
    }
    setStoreImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setStoreImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveStoreSettings = async () => {
    setSavingSettings(true);
    try {
      let finalImageUrl = storeImagePreview;

      // Upload store image if changed
      if (storeImageFile) {
        const formData = new FormData();
        formData.append('images', storeImageFile);
        const uploadRes = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.urls?.length > 0) {
          finalImageUrl = uploadData.urls[0];
        }
      }

      // Save settings
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeTitle, storeImage: finalImageUrl }),
      });
      
      await refreshSettings();
      alert('Store settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings. Check your server.');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Image file selection ───────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrorMsg('Some files are larger than 5MB and were skipped.');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url));
  };

  // ── Save product ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { setErrorMsg('Product name is required.'); return; }
    if (!form.price || isNaN(Number(form.price))) { setErrorMsg('Enter a valid price.'); return; }

    setSaving(true);
    setErrorMsg('');

    try {
      let uploadedUrls: string[] = [];

      // Upload new image files if any
      if (imageFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();
        imageFiles.forEach(f => formData.append('images', f));
        const uploadRes = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed');
        uploadedUrls = uploadData.urls || [];
        setUploading(false);
      }

      const allImages = [...existingImages, ...uploadedUrls];
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        status: form.status,
        description: form.description,
        images: allImages,
        paymentMethods: form.paymentMethods, // Mengirimkan metode pembayaran
      };

      if (editingProduct) {
        const res = await fetch(`${API_URL}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update product');
      } else {
        const res = await fetch(`${API_URL}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: `prod_${Date.now()}`, ...payload }),
        });
        if (!res.ok) throw new Error('Failed to add product');
      }

      await fetchProducts();
      closeModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Check your server.');
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Single delete ──────────────────────────────────────────────────────────
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  // ── Bulk delete ────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(products.map(p => p.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected product(s)?`)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error('Bulk delete failed');
      setSelectedIds(new Set());
      await fetchProducts();
    } catch (err) {
      alert('Bulk delete failed. Check your server.');
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black" />
    </div>
  );
  if (!isAdmin) return <Navigate to="/" />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pt-32 pb-24 max-w-[1400px] mx-auto px-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-[0.2em] mb-2">Admin Panel</h1>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">Database: MySQL (XAMPP)</p>
        </div>
        <div className="flex bg-gray-100 p-1">
          {(['orders', 'products', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats - Disembunyikan di tab Settings untuk kerapian */}
      {activeTab !== 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Inventory Items', value: products.length },
            { label: 'Total Revenue', value: orders.reduce((a, c) => a + (Number(c.total) || 0), 0) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col group hover:border-black transition-colors">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mb-2">{label}</span>
              <span className="text-2xl font-display font-bold">
                {typeof value === 'number' && label === 'Total Revenue' ? `Rp ${value.toLocaleString('id-ID')}` : value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center text-gray-400 uppercase tracking-widest text-xs">Loading data...</div>
        ) : activeTab === 'orders' ? (
          orders.length === 0 ? (
            <div className="py-32 bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center">
              <Package className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-400 font-display uppercase tracking-widest text-sm">No orders found</p>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map(order => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={order.id}
                  className="bg-white border border-gray-100 p-8 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-8 justify-between">
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="bg-black text-white px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-3">Customer</h4>
                          <p className="text-xs font-bold uppercase tracking-widest">{order.customerName}</p>
                          <p className="text-[10px] text-gray-500 tracking-widest uppercase truncate">{order.customerEmail}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-3">Total Paid</h4>
                          <span className="text-xl font-display font-bold">Rp {(order.total || 0).toLocaleString('id-ID')}</span>
                          {order.paymentMethod && (
                            <div className="mt-1 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                               <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{order.paymentMethod}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-1/3 bg-gray-50 p-6">
                      <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-6">Line Items</h4>
                      <div className="space-y-4">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] font-bold tracking-widest uppercase">
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 bg-black text-white text-[9px] flex items-center justify-center rounded-sm">{item.quantity}</span>
                              <span>{item.name}</span>
                            </div>
                            <span>Rp {((item.price || 0) * (item.quantity || 0)).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : activeTab === 'settings' ? (
          /* SETTINGS TAB */
          <div className="max-w-2xl bg-white border border-gray-100 shadow-sm p-8">
             <div className="flex items-center gap-3 mb-8">
                <Settings className="w-6 h-6" />
                <h2 className="font-display text-xl font-bold uppercase tracking-widest">Store Configuration</h2>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Store Title</label>
                  <input type="text" value={storeTitle} onChange={e => setStoreTitle(e.target.value)}
                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-sm font-bold uppercase tracking-widest"
                    placeholder="Enter store title" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Store Banner/Logo</label>
                  {storeImagePreview && (
                    <div className="mb-4 relative w-48 h-32">
                       <img src={storeImagePreview} alt="Store" className="w-full h-full object-cover border border-gray-200" />
                       <button onClick={() => { setStoreImagePreview(''); setStoreImageFile(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <X className="w-3 h-3" />
                       </button>
                    </div>
                  )}
                  <input ref={storeImageInputRef} type="file" accept="image/*" onChange={handleStoreImageChange} className="hidden" />
                  <button onClick={() => storeImageInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:border-black hover:text-black transition-colors flex flex-col items-center gap-2">
                    <Upload className="w-5 h-5" />
                    {storeImagePreview ? 'Change Store Image' : 'Upload Store Image'}
                  </button>
                </div>

                <button onClick={saveStoreSettings} disabled={savingSettings}
                  className="mt-6 bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50">
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
             </div>
          </div>
        ) : (
          /* PRODUCTS TAB */
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-bold uppercase tracking-widest">Product Inventory</h2>
                {selectedIds.size > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-500 px-2 py-1">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {selectedIds.size > 0 && (
                  <button onClick={handleBulkDelete} disabled={bulkDeleting}
                    className="bg-red-500 text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                    {bulkDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}
                  </button>
                )}
                <button onClick={openAddModal}
                  className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    <th className="px-4 py-4">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-black transition-colors">
                        {selectedIds.size === products.length && products.length > 0
                          ? <CheckSquare className="w-4 h-4" />
                          : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="px-4 py-4">Image</th>
                    <th className="px-4 py-4">Product Info</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(product.id) ? 'bg-red-50/40' : ''}`}>
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(product.id)} className="text-gray-400 hover:text-black transition-colors">
                          {selectedIds.has(product.id) ? <CheckSquare className="w-4 h-4 text-red-500" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name}
                            className="w-12 h-12 object-cover border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                            <ImageOff className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-xs font-bold uppercase tracking-widest block">{product.name}</span>
                        <span className="text-[9px] text-gray-400 tracking-widest uppercase">ID: {product.id}</span>
                      </td>
                      <td className="px-4 py-6 text-[10px] font-bold uppercase tracking-widest">{product.category}</td>
                      <td className="px-4 py-6 text-xs font-bold">Rp {Number(product.price || 0).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-6">
                        <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${product.status === 'In Stock' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-black transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="py-20 text-center text-gray-400 font-display uppercase tracking-widest text-xs">
                  Your MySQL product table is currently empty
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white z-[70] p-10 max-h-[90vh] overflow-y-auto">

              <div className="flex justify-between items-start mb-8">
                <h2 className="font-display text-2xl font-bold uppercase tracking-widest">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Product Name *</label>
                  <input type="text" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-xs font-bold uppercase tracking-widest"
                    placeholder="e.g. Classic Oversized Tee" />
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Price (Rp) *</label>
                    <input type="number" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-xs font-bold tracking-widest"
                      placeholder="250000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-xs font-bold uppercase tracking-widest bg-transparent">
                      {['T-Shirt', 'Pants', 'Outwear', 'Accessories', 'New Arrival'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-xs font-bold uppercase tracking-widest bg-transparent">
                    <option>In Stock</option>
                    <option>Sold Out</option>
                  </select>
                </div>
                
                {/* Payment Methods */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Methods</label>
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_PAYMENT_METHODS.map(method => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-widest">
                        <input
                          type="checkbox"
                          checked={form.paymentMethods.includes(method)}
                          onChange={() => togglePaymentMethod(method)}
                          className="w-3 h-3 text-black border-gray-300 focus:ring-black"
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Optional product description..."
                    className="w-full border-b border-gray-200 py-2 focus:border-black outline-none text-xs tracking-widest resize-none" />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Product Images</label>

                  {/* Existing images (edit mode) */}
                  {existingImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">Current Images</p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map(url => (
                          <div key={url} className="relative w-16 h-16 group">
                            <img src={url} alt="" className="w-full h-full object-cover border border-gray-200" />
                            <button onClick={() => removeExistingImage(url)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New image previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">New Images</p>
                      <div className="flex flex-wrap gap-2">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative w-16 h-16 group">
                            <img src={src} alt="" className="w-full h-full object-cover border border-gray-200" />
                            <button onClick={() => removeNewImage(idx)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload button */}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:border-black hover:text-black transition-colors flex flex-col items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Click to upload images (max 5MB each)
                  </button>
                </div>

                {/* Error */}
                {errorMsg && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{errorMsg}</p>}

                {/* Save */}
                <button onClick={handleSave} disabled={saving}
                  className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50">
                  {uploading ? 'Uploading Images...' : saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save to Database'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};