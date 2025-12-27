import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, CartItem } from './types';
import { RAW_PRODUCT_NAMES, PRODUCT_ASSETS, PRODUCT_PRICES, PRODUCT_RETAIL_PRICES, PRODUCT_STOCK } from './constants';
import { enrichProductData } from './services/geminiService';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';

const CACHE_KEY = 'innova_catalog_v47'; // Incrementado a v47 para aplicar cambios de precio

const LogoHexagon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      <path 
        d="M50 5 L93.3 30 V70 L50 95 L6.7 70 V30 Z" 
        fill="#0f172a" 
        stroke="#06b6d4" 
        strokeWidth="6"
      />
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fill="#f8fafc" 
        fontFamily="Inter, sans-serif" 
        fontWeight="900" 
        fontSize="34"
        letterSpacing="-1"
      >
        IN
      </text>
    </svg>
  </div>
);

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length === RAW_PRODUCT_NAMES.length) {
            setProducts(parsed);
            setLoading(false);
            return;
          }
        }

        const data = await enrichProductData(RAW_PRODUCT_NAMES);
        const enriched = RAW_PRODUCT_NAMES.map((originalName, index) => {
          const aiResult = data.products.find(p => p.originalIndex === index) || data.products[index];
          const assets = PRODUCT_ASSETS[originalName] || {};
          const wholesalePrice = PRODUCT_PRICES[originalName] || (aiResult?.price || 0);
          const retailPrice = PRODUCT_RETAIL_PRICES[originalName] || Math.round(wholesalePrice * 1.2);
          const stock = PRODUCT_STOCK[originalName] ?? 7;

          return {
            id: `prod-${index}`,
            name: aiResult?.name || originalName,
            category: aiResult?.category || Category.HOME,
            description: aiResult?.description || "Producto de alta calidad.",
            price: wholesalePrice,
            retailPrice: retailPrice,
            stock: stock,
            image: assets.image || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800`,
            features: aiResult?.features || ["Garantía de calidad", "Envío nacional", "Excelente precio"],
            videoUrl: assets.video,
            originalIndex: index
          } as Product;
        });

        localStorage.setItem(CACHE_KEY, JSON.stringify(enriched));
        setProducts(enriched);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.min(item.stock, Math.max(1, item.quantity + delta)) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === Category.ALL || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <LogoHexagon className="w-20 h-20 animate-bounce mb-6" />
        <p className="text-slate-400 text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">In-Nova está llegando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-cyan-100 relative">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center justify-between md:justify-start gap-6">
            <div className="flex items-center space-x-4">
              <LogoHexagon className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tighter">In-Nova</h1>
                <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mt-1 inline-block">Distribuciones</span>
              </div>
            </div>
            <button onClick={() => setIsCartOpen(true)} className="md:hidden relative p-3 bg-slate-900 text-white rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{totalItemsCount}</span>
              )}
            </button>
          </div>
          
          <div className="relative flex-1 max-w-lg mx-auto md:mx-0">
            <input 
              type="text" 
              placeholder="¿Qué innovamos hoy?" 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-14 pr-4 text-sm focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none shadow-sm" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <svg className="absolute left-5 top-4 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button onClick={() => setIsCartOpen(true)} className="hidden md:flex items-center gap-4 bg-slate-900 text-white px-6 py-3.5 rounded-2xl hover:bg-cyan-600 transition-all group relative">
            <span className="text-xs font-black uppercase tracking-widest">Mi Pedido</span>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="text-sm font-black">{totalItemsCount}</span>
            </div>
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-10">
        <div className="flex overflow-x-auto pb-6 mb-10 space-x-3 no-scrollbar snap-x">
          {Object.values(Category).map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all snap-start ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100 hover:border-slate-200'}`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onClick={setSelectedProduct} />
          ))}
        </div>
      </main>

      {/* Floating Cart Button for Mobile */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-slate-900 text-white p-5 rounded-full shadow-2xl md:hidden hover:scale-110 active:scale-95 transition-all"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        {totalItemsCount > 0 && (
          <span className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-black w-7 h-7 flex items-center justify-center rounded-full border-4 border-slate-50">{totalItemsCount}</span>
        )}
      </button>

      <footer className="bg-white border-t border-slate-100 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <LogoHexagon className="w-14 h-14 mx-auto mb-8 opacity-20" />
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-4">Innovación Local • Calidad Global</p>
          <div className="text-[12px] text-slate-900 font-black tracking-[0.5em] uppercase">DISTRIBUCIONES IN-NOVA 2025</div>
        </div>
      </footer>

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={(p, q) => {
          addToCart(p, q);
          setSelectedProduct(null);
        }}
      />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onUpdateQuantity={updateCartQuantity} 
        onRemove={removeFromCart} 
      />
    </div>
  );
};

export default App;