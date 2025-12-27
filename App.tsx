import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, CartItem } from './types';
import { RAW_PRODUCT_NAMES, PRODUCT_ASSETS, PRODUCT_PRICES, PRODUCT_RETAIL_PRICES, PRODUCT_STOCK, PRODUCT_DESCRIPTIONS } from './constants';
import { enrichProductData } from './services/geminiService';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';

const CACHE_KEY = 'innova_catalog_v61'; 

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
        
        // Productos que el usuario agregó hoy específicamente para "Lo Nuevo"
        const NEW_TODAY = ["HIDROLAVADORA", "SECADOR AGUACATE", "TOPE DE PUERTA", "CEPILLO SECADOR 5 EN 1"];

        const baseProducts: Product[] = RAW_PRODUCT_NAMES.map((name, index) => {
          const isCombo = name.toLowerCase().includes("combo");
          const isNewToday = NEW_TODAY.includes(name);
          
          return {
            id: `prod-${index}`,
            name: name,
            category: isCombo ? Category.COMBOS : Category.HOME,
            description: PRODUCT_DESCRIPTIONS[name] || "Producto innovador de alta calidad para tu hogar.",
            price: PRODUCT_PRICES[name] || 0,
            retailPrice: PRODUCT_RETAIL_PRICES[name] || 0,
            stock: PRODUCT_STOCK[name] || 5,
            image: PRODUCT_ASSETS[name]?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
            features: ["Calidad garantizada", "Envío rápido", "Mejor precio"],
            videoUrl: PRODUCT_ASSETS[name]?.video,
            originalIndex: index,
            isNew: isNewToday, // Marcamos específicamente los de hoy
            isCombo: isCombo
          };
        });

        setProducts(baseProducts);

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

        const aiData = await enrichProductData(RAW_PRODUCT_NAMES);
        if (aiData && aiData.products && aiData.products.length > 0) {
          const enriched = baseProducts.map((p, idx) => {
            const ai = aiData.products.find(item => item.originalIndex === idx);
            if (ai) {
              return {
                ...p,
                name: ai.name || p.name,
                category: p.isCombo ? Category.COMBOS : (ai.category || p.category),
                description: ai.description.length > 50 ? ai.description : p.description,
                features: ai.features || p.features
              };
            }
            return p;
          });
          setProducts(enriched);
          localStorage.setItem(CACHE_KEY, JSON.stringify(enriched));
        }
      } catch (err) {
        console.error("Fallo en inicialización:", err);
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

  const combos = useMemo(() => products.filter(p => p.isCombo), [products]);
  const newArrivals = useMemo(() => products.filter(p => p.isNew && !p.isCombo), [products]);
  
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
              <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">In-Nova</h1>
              <p className="text-[8px] font-bold text-cyan-600 uppercase tracking-widest">Distribuciones</p>
            </div>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" placeholder="Buscar en el catálogo..." 
              className="w-full bg-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <button onClick={() => setIsCartOpen(true)} className="bg-slate-900 text-white p-2.5 rounded-xl relative hover:bg-cyan-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Sección Combos Destacados */}
        {combos.length > 0 && searchTerm === "" && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                <span className="text-amber-500">🔥</span> Combos Imperdibles
              </h2>
              <div className="h-px bg-slate-200 flex-grow mx-6 hidden sm:block"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {combos.slice(0, 2).map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 h-64 cursor-pointer shadow-xl transition-all hover:shadow-amber-500/20">
                  <img src={p.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block">Súper Oferta</span>
                    <h3 className="text-white text-xl font-black uppercase leading-tight mb-2 group-hover:text-amber-400 transition-colors">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-300 text-xs line-clamp-1 max-w-[60%] italic">{p.description}</p>
                      <span className="text-2xl font-black text-white">${new Intl.NumberFormat('es-CO').format(p.retailPrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección Lo Nuevo */}
        {newArrivals.length > 0 && searchTerm === "" && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                <span className="text-cyan-500">✨</span> Lo Nuevo
              </h2>
              <div className="h-px bg-slate-200 flex-grow mx-6 hidden sm:block"></div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
              {newArrivals.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className="min-w-[200px] sm:min-w-[240px] bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50">
                    <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                    <span className="absolute top-2 left-2 bg-cyan-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Nuevo</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-[10px] uppercase truncate mb-1">{p.name}</h4>
                  <p className="text-cyan-600 font-black text-sm">${new Intl.NumberFormat('es-CO').format(p.retailPrice)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Catálogo General */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              Catálogo Completo
            </h2>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {Object.values(Category).map(cat => (
              <button 
                key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
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
        </section>
      </main>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} />
      
      <footer className="bg-white py-16 text-center border-t border-slate-100 mt-20">
        <div className="mb-6 flex justify-center">
          <LogoHexagon className="w-12 h-12 grayscale opacity-20" />
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Distribuciones In-Nova 2025</p>
        <p className="text-slate-400 text-[8px] mt-2 font-bold uppercase">Calidad e Innovación a tu alcance</p>
      </footer>
    </div>
  );
};

export default App;