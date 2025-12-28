
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
      format: "a4"
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
        if (!url || url.includes('unsplash.com')) { resolve(""); return; }
        
        // Anti-CORS simple
        const proxyUrl = url.includes('?') ? `${url}&v=2` : `${url}?v=2`;
        
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(""); return; }
          const maxDim = 500;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (maxDim / w) * h; w = maxDim; }
            else { w = (maxDim / h) * w; h = maxDim; }
          }
          canvas.width = w; canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          try { resolve(canvas.toDataURL("image/jpeg", 0.75)); } catch (e) { resolve(""); }
        };
        img.onerror = () => resolve("");
        setTimeout(() => resolve(""), 7000);
        img.src = proxyUrl;
      });
    };

    // PORTADA
    doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    const cx = pageWidth / 2;
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(60);
    doc.text("IN-NOVA", cx, pageHeight/2.5, { align: "center" });
    doc.setFontSize(14);
    doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.text("DISTRIBUCIONES MAYORISTAS", cx, pageHeight/2.5 + 12, { align: "center", charSpace: 2 });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("CATÁLOGO 2025", cx, pageHeight - 60, { align: "center" });
    doc.setFontSize(12);
    doc.text(`WhatsApp de Pedidos: +${whatsappPhone}`, cx, pageHeight - 35, { align: "center" });

    // PRODUCTOS
    const activeProducts = products.filter(p => p.stock > 0);
    const colWidth = (pageWidth - (margin * 3)) / 2;
    const cardHeight = 112;
    let currentY = 35;
    let column = 0;

    for (let i = 0; i < activeProducts.length; i++) {
      const p = activeProducts[i];
      if (i % 4 === 0) {
        doc.addPage();
        doc.setFillColor(252, 252, 254);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("IN-NOVA DISTRIBUCIONES", margin, 13);
        doc.text(`PÁG ${doc.internal.getNumberOfPages()}`, pageWidth - margin, 13, { align: "right" });
        currentY = 32; column = 0;
      }

      const x = margin + (column * (colWidth + margin));
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 230);
      doc.roundedRect(x, currentY, colWidth, cardHeight - 8, 3, 3, 'FD');

      // Imagen
      doc.setFillColor(245, 245, 248);
      doc.rect(x + 2, currentY + 2, colWidth - 4, 58, 'F');
      const img = await getImageData(p.image);
      if (img) {
        try { doc.addImage(img, 'JPEG', x + 4, currentY + 4, colWidth - 8, 54); } catch (e) {}
      } else {
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(8);
        doc.text("FOTO EN CATÁLOGO WEB", x + colWidth/2, currentY + 30, { align: "center" });
      }

      // Info
      doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      const nameL = doc.splitTextToSize(p.name.toUpperCase(), colWidth - 8);
      doc.text(nameL, x + 4, currentY + 68);

      doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      const dL = doc.splitTextToSize(p.description, colWidth - 8);
      doc.text(dL.slice(0, 2), x + 4, currentY + 78);

      // Precios
      doc.setDrawColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
      doc.line(x + 4, currentY + 88, x + colWidth - 4, currentY + 88);
      doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(formatPrice(p.retailPrice), x + 4, currentY + 95);
      doc.setFontSize(6);
      doc.text("AL DETAL", x + 4, currentY + 99);
      doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
      doc.setFontSize(10);
      doc.text(formatPrice(p.price), x + colWidth - 4, currentY + 95, { align: "right" });
      doc.setFontSize(6);
      doc.text("AL MAYOR", x + colWidth - 4, currentY + 99, { align: "right" });

      if (column === 0) { column = 1; } else { column = 0; currentY += cardHeight; }
    }

    doc.save(`Catalogo_InNova_2025.pdf`);
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
    if (confirm("¿Eliminar?")) {
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
        <div className="fixed top-20 left-4 z-[60] flex flex-col gap-2">
          <button onClick={() => setAdminView(!adminView)} className="bg-cyan-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
            {adminView ? 'Cerrar Panel' : 'Administrar'}
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAdminView(false)}>
            <LogoHexagon className="w-10 h-10" />
            <h1 className="hidden sm:block text-xl font-black uppercase tracking-tighter text-slate-900">In-Nova</h1>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <input type="text" placeholder="Buscar productos..." className="w-full bg-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div className="flex items-center gap-2">
            {!adminView && (
              <button onClick={downloadCatalogPdf} disabled={isGeneratingPdf} className="hidden sm:flex items-center gap-2 bg-white text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                {isGeneratingPdf ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-900 border-t-transparent" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                {isGeneratingPdf ? 'Procesando...' : 'Catálogo PDF'}
              </button>
            )}
            <button onClick={() => setIsAdminModalOpen(true)} className={`p-2.5 rounded-xl ${isAdmin ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></button>
            <button onClick={() => setIsCartOpen(true)} className="bg-slate-900 text-white p-2.5 rounded-xl relative"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}</button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {adminView && isAdmin ? (
          <AdminDashboard products={products} sales={sales} whatsappPhone={whatsappPhone} onUpdateProduct={updateProduct} onAddProduct={addProduct} onDeleteProduct={deleteProduct} onUpdateSettings={(p) => { setWhatsappPhone(p); localStorage.setItem(SETTINGS_KEY, JSON.stringify({ phone: p })); }} onClearSales={() => { setSales([]); localStorage.removeItem(SALES_KEY); }} />
        ) : (
          <section>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
              {Object.values(Category).map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} whatsappPhone={whatsappPhone} onClick={setSelectedProduct} />)}
            </div>
          </section>
        )}
      </main>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} whatsappPhone={whatsappPhone} onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.min(i.stock, Math.max(1, i.quantity + d))} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={finalizeSale} />
      <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onLogin={handleAdminLogin} onLogout={() => { setIsAdmin(false); setAdminView(false); sessionStorage.removeItem('is_nova_admin'); }} isAdmin={isAdmin} />
    </div>
  );
};

export default App;
