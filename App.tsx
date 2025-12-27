
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, CartItem } from './types';
import { RAW_PRODUCT_NAMES, PRODUCT_ASSETS, PRODUCT_PRICES, PRODUCT_RETAIL_PRICES, PRODUCT_STOCK } from './constants';
import { enrichProductData } from './services/geminiService';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';

const CACHE_KEY = 'innova_catalog_v50';

const LogoHexagon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      <path d="M50 5 L93.3 30 V70 L50 95 L6.7 70 V30 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="6"/>
      <text x="50" y="62" textAnchor="middle" fill="#f8fafc" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="34" letterSpacing="-1">IN</text>
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
        
        // 1. Cargar productos locales primero (resiliencia)
        const baseProducts = RAW_PRODUCT_NAMES.map((name, index) => ({
          id: `prod-${index}`,
          name: name,
          category: Category.HOME,
          description: "Producto innovador de alta calidad para tu hogar.",
          price: PRODUCT_PRICES[name] || 0,
          retailPrice: PRODUCT_RETAIL_PRICES[name] || 0,
          stock: PRODUCT_STOCK[name] || 5,
          image: PRODUCT_ASSETS[name]?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
          features: ["Calidad garantizada", "Envío rápido", "Mejor precio"],
          videoUrl: PRODUCT_ASSETS[name]?.video,
          originalIndex: index
        }));

        setProducts(baseProducts);

        // 2. Intentar cargar desde caché o API
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed);
              setLoading(false);
              return;
            }
          } catch(e) { console.error("Error parseando cache"); }
        }

        // 3. Intentar enriquecer con Gemini
        const aiData = await enrichProductData(RAW_PRODUCT_NAMES);
        if (aiData && aiData.products && aiData.products.length > 0) {
          const enriched = baseProducts.map((p, idx) => {
            const ai = aiData.products.find(item => item.originalIndex === idx);
            if (ai) {
              return {
                ...p,
                name: ai.name || p.name,
                category: ai.category || p.category,
                description: ai.description || p.description,
                features: ai.features || p.features
              };
            }
            return p;
          });
          setProducts(enriched);
          localStorage.setItem(CACHE_KEY, JSON.stringify(enriched));
        }
      } catch (err) {
        console.error("Fallo crítico en carga de App:", err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item);
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === Category.ALL || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <LogoHexagon className="w-16 h-16 animate-pulse mb-4" />
        <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Cargando In-Nova...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoHexagon className="w-10 h-10" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-black uppercase tracking-tighter">In-Nova</h1>
              <p className="text-[8px] font-bold text-cyan-600 uppercase tracking-widest">Distribuciones</p>
            </div>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" placeholder="Buscar producto..." 
              className="w-full bg-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <button onClick={() => setIsCartOpen(true)} className="bg-slate-900 text-white p-2.5 rounded-xl relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {Object.values(Category).map(cat => (
            <button 
              key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
          ))}
        </div>
      </main>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} />
      
      <footer className="bg-white py-10 text-center border-t border-slate-100 mt-10">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Distribuciones In-Nova 2025</p>
      </footer>
    </div>
  );
};

export default App;
