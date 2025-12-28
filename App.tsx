
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, CartItem } from './types';
import { RAW_PRODUCT_NAMES, PRODUCT_ASSETS, PRODUCT_PRICES, PRODUCT_RETAIL_PRICES, PRODUCT_STOCK, PRODUCT_DESCRIPTIONS, WHATSAPP_PHONE as DEFAULT_PHONE } from './constants';
import { enrichProductData } from './services/geminiService';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import AdminModal from './components/AdminModal';
import AdminDashboard from './components/AdminDashboard';
import { jsPDF } from "jspdf";

const DB_KEY = 'innova_full_db_v2';
const SALES_KEY = 'innova_sales_history_v2';
const SETTINGS_KEY = 'innova_settings_v2';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800';

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
  const [sales, setSales] = useState<any[]>([]);
  const [whatsappPhone, setWhatsappPhone] = useState(DEFAULT_PHONE);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminView, setAdminView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('is_nova_admin') === 'true';
    if (savedAdmin) setIsAdmin(true);

    const initApp = async () => {
      try {
        setLoading(true);
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setWhatsappPhone(settings.phone || DEFAULT_PHONE);
        }
        const savedSales = localStorage.getItem(SALES_KEY);
        if (savedSales) setSales(JSON.parse(savedSales));
        const savedDB = localStorage.getItem(DB_KEY);
        let currentProducts: Product[] = [];

        if (savedDB) {
          currentProducts = JSON.parse(savedDB);
        } else {
          // Tomar los últimos 12 para marcarlos como nuevos inicialmente
          const lastTwelveStartIndex = Math.max(0, RAW_PRODUCT_NAMES.length - 12);
          currentProducts = RAW_PRODUCT_NAMES.map((name, index) => {
            const isCombo = name.toLowerCase().includes("combo");
            return {
              id: `prod-${index}-${Date.now()}`,
              name: name,
              category: isCombo ? Category.COMBOS : Category.HOME,
              description: PRODUCT_DESCRIPTIONS[name] || "Producto de alta calidad.",
              price: PRODUCT_PRICES[name] || 0,
              retailPrice: PRODUCT_RETAIL_PRICES[name] || 0,
              stock: PRODUCT_STOCK[name] || 0,
              image: PRODUCT_ASSETS[name]?.image || FALLBACK_IMAGE,
              features: ["Calidad garantizada"],
              videoUrl: PRODUCT_ASSETS[name]?.video,
              isNew: index >= lastTwelveStartIndex, 
              isCombo: isCombo
            };
          });
          localStorage.setItem(DB_KEY, JSON.stringify(currentProducts));
        }
        setProducts(currentProducts);
      } catch (err) {
        console.error("Error inicializando:", err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const downloadCatalogPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const colors = {
      navy: [15, 23, 42],
      cyan: [6, 182, 212],
      slate: [100, 116, 139]
    };

    const formatPrice = (p: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

    const getImageData = (url: string): Promise<string> => {
      return new Promise((resolve) => {
        if (!url) { resolve(""); return; }
        // Si ya es base64, lo devolvemos tal cual
        if (url.startsWith('data:')) { resolve(url); return; }
        
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(""); return; }
          // Calidad reducida para PDF móvil rápido
          const maxDim = 400;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (maxDim / w) * h; w = maxDim; }
            else { w = (maxDim / h) * w; h = maxDim; }
          }
          canvas.width = w; canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          try { resolve(canvas.toDataURL("image/jpeg", 0.6)); } catch (e) { resolve(""); }
        };
        img.onerror = () => resolve("");
        setTimeout(() => resolve(""), 5000);
        img.src = url;
      });
    };

    // PORTADA
    doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    const cx = pageWidth / 2;
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(50);
    doc.text("IN-NOVA", cx, pageHeight/2.5, { align: "center" });
    doc.setFontSize(14);
    doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.text("DISTRIBUCIONES 2025", cx, pageHeight/2.5 + 12, { align: "center", charSpace: 2 });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("CATÁLOGO PARA CELULAR", cx, pageHeight - 60, { align: "center" });

    // PRODUCTOS
    const activeProducts = products.filter(p => p.stock > 0);
    const colWidth = (pageWidth - (margin * 3)) / 2;
    const cardHeight = 110;
    let currentY = 30;
    let column = 0;

    for (let i = 0; i < activeProducts.length; i++) {
      const p = activeProducts[i];
      if (i % 4 === 0) {
        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text("IN-NOVA DISTRIBUCIONES", margin, 10);
        currentY = 25; column = 0;
      }

      const x = margin + (column * (colWidth + margin));
      doc.setDrawColor(240, 240, 240);
      doc.roundedRect(x, currentY, colWidth, cardHeight - 10, 2, 2, 'D');

      const img = await getImageData(p.image);
      if (img) {
        try { doc.addImage(img, 'JPEG', x + 2, currentY + 2, colWidth - 4, 55); } catch (e) {}
      }

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      const nameL = doc.splitTextToSize(p.name.toUpperCase(), colWidth - 4);
      doc.text(nameL, x + 2, currentY + 62);

      doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
      doc.setFontSize(10);
      doc.text(formatPrice(p.retailPrice), x + 2, currentY + 75);
      doc.setFontSize(6);
      doc.text("PRECIO DETAL", x + 2, currentY + 78);

      if (column === 0) { column = 1; } else { column = 0; currentY += cardHeight; }
    }

    // Guardar para móvil
    doc.save(`Catalogo_InNova_Movil.pdf`);
    setIsGeneratingPdf(false);
  };

  const updateProduct = (updatedProd: Product) => {
    const newProducts = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(newProducts);
    localStorage.setItem(DB_KEY, JSON.stringify(newProducts));
  };

  const addProduct = () => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: "Nuevo Producto",
      category: Category.HOME,
      description: "Descripción...",
      price: 0,
      retailPrice: 0,
      stock: 10,
      image: FALLBACK_IMAGE,
      features: ["Calidad"],
      isNew: true
    };
    const n = [newProd, ...products];
    setProducts(n);
    localStorage.setItem(DB_KEY, JSON.stringify(n));
  };

  const deleteProduct = (id: string) => {
    if (confirm("¿Eliminar producto?")) {
      const n = products.filter(p => p.id !== id);
      setProducts(n);
      localStorage.setItem(DB_KEY, JSON.stringify(n));
    }
  };

  const handleAdminLogin = (p: string) => {
    if (p === '0110') {
      setIsAdmin(true);
      sessionStorage.setItem('is_nova_admin', 'true');
      return true;
    }
    return false;
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item);
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const finalizeSale = () => {
    const nP = products.map(p => {
      const ci = cart.find(x => x.id === p.id);
      return ci ? { ...p, stock: Math.max(0, p.stock - ci.quantity) } : p;
    });
    const nS = {
      id: `s-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart.map(i => ({ name: i.name, qty: i.quantity, price: i.quantity >= 5 ? i.price : i.retailPrice, cost: i.price })),
      total: cart.reduce((a, b) => a + (b.quantity >= 5 ? b.price : b.retailPrice) * b.quantity, 0)
    };
    const nH = [nS, ...sales];
    setProducts(nP); setSales(nH); setCart([]); setIsCartOpen(false);
    localStorage.setItem(DB_KEY, JSON.stringify(nP));
    localStorage.setItem(SALES_KEY, JSON.stringify(nH));
  };

  const newArrivals = useMemo(() => {
    return products.filter(p => p.isNew).slice(0, 12);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const mC = selectedCategory === Category.ALL || p.category === selectedCategory;
      const mS = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return mC && mS;
    });
  }, [products, selectedCategory, searchTerm]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <button 
            onClick={() => setAdminView(!adminView)} 
            className="bg-slate-900 text-cyan-400 p-4 rounded-full shadow-2xl border border-cyan-400/20 flex items-center gap-2 hover:scale-110 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">{adminView ? 'Cerrar' : 'Panel'}</span>
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setAdminView(false); setSelectedCategory(Category.ALL); setSearchTerm(''); }}>
            <LogoHexagon className="w-10 h-10" />
            <h1 className="hidden sm:block text-xl font-black uppercase tracking-tighter text-slate-900">In-Nova</h1>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <input type="text" placeholder="Buscar..." className="w-full bg-slate-100 rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 border-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div className="flex items-center gap-2">
            {!adminView && (
              <button 
                onClick={downloadCatalogPdf} 
                disabled={isGeneratingPdf} 
                className="bg-cyan-500 text-white p-2.5 rounded-2xl shadow-lg shadow-cyan-100 flex items-center gap-2 hover:bg-cyan-600 transition-colors disabled:opacity-50"
              >
                {isGeneratingPdf ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">{isGeneratingPdf ? 'Generando...' : 'Catálogo PDF'}</span>
              </button>
            )}
            <button onClick={() => setIsAdminModalOpen(true)} className={`p-2.5 rounded-2xl ${isAdmin ? 'bg-slate-900 text-cyan-400' : 'bg-slate-100 text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></button>
            <button onClick={() => setIsCartOpen(true)} className="bg-slate-900 text-white p-2.5 rounded-2xl relative"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}</button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {adminView && isAdmin ? (
          <AdminDashboard products={products} sales={sales} whatsappPhone={whatsappPhone} onUpdateProduct={updateProduct} onAddProduct={addProduct} onDeleteProduct={deleteProduct} onUpdateSettings={(p) => { setWhatsappPhone(p); localStorage.setItem(SETTINGS_KEY, JSON.stringify({ phone: p })); }} onClearSales={() => { setSales([]); localStorage.removeItem(SALES_KEY); }} />
        ) : (
          <div className="space-y-12">
            {/* Sección Lo Nuevo */}
            {newArrivals.length > 0 && searchTerm === '' && selectedCategory === Category.ALL && (
              <section className="animate-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-cyan-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Lo Nuevo</span>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Novedades In-Nova</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  {newArrivals.map(p => (
                    <div key={p.id} onClick={() => setSelectedProduct(p)} className="min-w-[200px] sm:min-w-[240px] bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                      </div>
                      <h4 className="font-black text-slate-900 text-xs uppercase truncate mb-1">{p.name}</h4>
                      <p className="text-cyan-600 font-black text-lg tracking-tighter">${new Intl.NumberFormat('es-CO').format(p.retailPrice)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Catálogo General */}
            <section>
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Explorar Catálogo</h2>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {Object.values(Category).map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} whatsappPhone={whatsappPhone} onClick={setSelectedProduct} />)}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No se encontraron productos</p>
                    <button onClick={() => { setSelectedCategory(Category.ALL); setSearchTerm(''); }} className="text-cyan-600 font-black text-[10px] uppercase tracking-[0.2em] underline">Ver todo el catálogo</button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} whatsappPhone={whatsappPhone} onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.min(i.stock, Math.max(1, i.quantity + d))} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={finalizeSale} />
      <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onLogin={handleAdminLogin} onLogout={() => { setIsAdmin(false); setAdminView(false); sessionStorage.removeItem('is_nova_admin'); }} isAdmin={isAdmin} />
    </div>
  );
};

export default App;
