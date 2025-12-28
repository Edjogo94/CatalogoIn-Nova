
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
              image: PRODUCT_ASSETS[name]?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
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
      slate: [100, 116, 139],
      light: [248, 250, 252]
    };

    const formatPrice = (p: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);

    const getImageData = (url: string): Promise<string> => {
      return new Promise((resolve) => {
        // Añadimos cache-busting para evitar bloqueos de CDN/CORS
        const cleanUrl = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
        
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(""); return; }
          
          // Redimensionar para optimizar peso del PDF
          const maxDim = 600;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (maxDim / w) * h; w = maxDim; }
            else { w = (maxDim / h) * w; h = maxDim; }
          }
          
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = () => {
          console.warn("Fallo imagen:", url);
          resolve("");
        };
        // Tiempo de espera para carga
        setTimeout(() => resolve(""), 10000);
        img.src = cleanUrl;
      });
    };

    // --- PORTADA ---
    doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    const cx = pageWidth / 2;
    const cy = pageHeight / 2.5;
    
    // Logo y Título Portada
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(55);
    doc.text("IN-NOVA", cx, cy, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.text("DISTRIBUCIONES PREMIUM", cx, cy + 12, { align: "center", charSpace: 3 });

    doc.setDrawColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.setLineWidth(1);
    doc.line(cx - 30, cy + 20, cx + 30, cy + 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("CATÁLOGO OFICIAL 2025", cx, pageHeight - 60, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Hogar • Tecnología • Innovación", cx, pageHeight - 52, { align: "center" });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
    doc.text(`WhatsApp: +${whatsappPhone}`, cx, pageHeight - 35, { align: "center" });

    // --- PRODUCTOS ---
    const activeProducts = products.filter(p => p.stock > 0);
    const colWidth = (pageWidth - (margin * 3)) / 2;
    const cardHeight = 110;
    let currentY = 35;
    let column = 0;

    for (let i = 0; i < activeProducts.length; i++) {
      const p = activeProducts[i];
      
      if (i % 4 === 0) { // 4 productos por página
        doc.addPage();
        doc.setFillColor(252, 252, 254);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
        doc.rect(0, 0, pageWidth, 22, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("IN-NOVA DISTRIBUCIONES", margin, 14);
        doc.setFontSize(8);
        doc.text(`PÁGINA ${doc.internal.getNumberOfPages()}`, pageWidth - margin, 14, { align: "right" });
        currentY = 32;
        column = 0;
      }

      const x = margin + (column * (colWidth + margin));
      
      // Card Container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 235);
      doc.roundedRect(x, currentY, colWidth, cardHeight - 8, 4, 4, 'FD');

      // Imagen con Placeholder Seguro
      doc.setFillColor(248, 248, 250);
      doc.rect(x + 3, currentY + 3, colWidth - 6, 56, 'F');
      
      const imgBase64 = await getImageData(p.image);
      if (imgBase64) {
        try {
          doc.addImage(imgBase64, 'JPEG', x + 5, currentY + 5, colWidth - 10, 52, undefined, 'FAST');
        } catch (e) {
          doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
          doc.setFontSize(7);
          doc.text("VER EN CATÁLOGO WEB", x + colWidth/2, currentY + 30, { align: "center" });
        }
      } else {
        doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
        doc.setFontSize(7);
        doc.text("VER EN CATÁLOGO WEB", x + colWidth/2, currentY + 30, { align: "center" });
      }

      // Título y Descripción
      doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      const nameLines = doc.splitTextToSize(p.name.toUpperCase(), colWidth - 10);
      doc.text(nameLines, x + 5, currentY + 65);

      doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const descLines = doc.splitTextToSize(p.description, colWidth - 10);
      doc.text(descLines.slice(0, 2), x + 5, currentY + 75);

      // Precios Detal y Mayor
      doc.setFillColor(colors.navy[0], colors.navy[1], colors.navy[2]);
      doc.rect(x + 4, currentY + 84, colWidth - 8, 0.2, 'F');

      doc.setTextColor(colors.navy[0], colors.navy[1], colors.navy[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(formatPrice(p.retailPrice), x + 5, currentY + 91);
      doc.setFontSize(6);
      doc.text("PRECIO DETAL", x + 5, currentY + 95);

      doc.setTextColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
      doc.setFontSize(10);
      doc.text(formatPrice(p.price), x + colWidth - 5, currentY + 91, { align: "right" });
      doc.setFontSize(6);
      doc.text("PRECIO MAYOR", x + colWidth - 5, currentY + 95, { align: "right" });

      // Badge de Categoría
      doc.setFillColor(colors.cyan[0], colors.cyan[1], colors.cyan[2]);
      doc.roundedRect(x + 4, currentY + 4, 18, 4, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text(p.category.toUpperCase(), x + 13, currentY + 7, { align: "center" });

      // Avanzar Layout
      if (column === 0) {
        column = 1;
      } else {
        column = 0;
        currentY += cardHeight;
      }
    }

    doc.save(`CATALOGO_INNOVA_2025.pdf`);
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
      description: "Descripción del producto...",
      price: 0,
      retailPrice: 0,
      stock: 0,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      features: ["Calidad"],
      isNew: true
    };
    const newProducts = [newProd, ...products];
    setProducts(newProducts);
    localStorage.setItem(DB_KEY, JSON.stringify(newProducts));
  };

  const deleteProduct = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      localStorage.setItem(DB_KEY, JSON.stringify(newProducts));
    }
  };

  const updateSettings = (phone: string) => {
    setWhatsappPhone(phone);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ phone }));
  };

  const clearSales = () => {
    if (window.confirm("¿Deseas borrar todo el historial de ventas?")) {
      setSales([]);
      localStorage.removeItem(SALES_KEY);
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === '0110') {
      setIsAdmin(true);
      sessionStorage.setItem('is_nova_admin', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminView(false);
    sessionStorage.removeItem('is_nova_admin');
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
    const newProducts = products.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      return p;
    });

    const newSale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart.map(i => ({
        name: i.name,
        qty: i.quantity,
        price: i.quantity >= 5 ? i.price : i.retailPrice,
        cost: i.price
      })),
      total: cart.reduce((acc, i) => acc + (i.quantity >= 5 ? i.price : i.retailPrice) * i.quantity, 0)
    };

    const newSalesHistory = [newSale, ...sales];
    setProducts(newProducts);
    setSales(newSalesHistory);
    setCart([]);
    setIsCartOpen(false);
    
    localStorage.setItem(DB_KEY, JSON.stringify(newProducts));
    localStorage.setItem(SALES_KEY, JSON.stringify(newSalesHistory));
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

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      {isAdmin && (
        <div className="fixed top-20 left-4 z-[60] flex flex-col gap-2">
          <span className="bg-slate-900 text-cyan-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl border border-cyan-400/30">
            Administrador Activo
          </span>
          <button 
            onClick={() => setAdminView(!adminView)}
            className="bg-cyan-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-cyan-600 transition-all"
          >
            {adminView ? 'Catálogo' : 'Panel Gestión'}
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAdminView(false)}>
            <LogoHexagon className="w-10 h-10" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">In-Nova</h1>
              <p className="text-[8px] font-bold text-cyan-600 uppercase tracking-widest">Distribuciones</p>
            </div>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" placeholder="Buscar..." 
              className="w-full bg-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div className="flex items-center gap-2">
            {!adminView && (
              <button 
                onClick={downloadCatalogPdf}
                disabled={isGeneratingPdf}
                className="hidden sm:flex items-center gap-2 bg-white text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 min-w-[140px] justify-center"
              >
                {isGeneratingPdf ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-900 border-t-transparent" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                )}
                <span className="ml-2">{isGeneratingPdf ? 'Cargando Fotos...' : 'Catálogo PDF'}</span>
              </button>
            )}

            <button 
              onClick={() => setIsAdminModalOpen(true)} 
              className={`p-2.5 rounded-xl transition-all ${isAdmin ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </button>
            {!adminView && (
              <button onClick={() => setIsCartOpen(true)} className="bg-slate-900 text-white p-2.5 rounded-xl relative hover:bg-cyan-600 transition-colors shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {!adminView && (
          <div className="sm:hidden mb-6">
            <button 
              onClick={downloadCatalogPdf}
              disabled={isGeneratingPdf}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest shadow-sm"
            >
              {isGeneratingPdf ? (
                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              )}
              {isGeneratingPdf ? 'Procesando Imágenes...' : 'Descargar Catálogo Completo'}
            </button>
          </div>
        )}

        {adminView && isAdmin ? (
          <AdminDashboard 
            products={products} 
            sales={sales} 
            whatsappPhone={whatsappPhone}
            onUpdateProduct={updateProduct} 
            onAddProduct={addProduct}
            onDeleteProduct={deleteProduct}
            onUpdateSettings={updateSettings}
            onClearSales={clearSales}
          />
        ) : (
          <>
            {combos.length > 0 && searchTerm === "" && (
              <section className="mb-12">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-amber-500">🔥</span> Combos Especiales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {combos.slice(0, 2).map(p => (
                    <div key={p.id} onClick={() => setSelectedProduct(p)} className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 h-64 cursor-pointer shadow-xl transition-all">
                      <img src={p.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-8 w-full">
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block">Súper Oferta</span>
                        <h3 className="text-white text-xl font-black uppercase leading-tight mb-2">{p.name}</h3>
                        <p className="text-white/80 text-2xl font-black">${new Intl.NumberFormat('es-CO').format(p.retailPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {newArrivals.length > 0 && searchTerm === "" && (
              <section className="mb-12">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-cyan-500">✨</span> Lo Nuevo
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                  {newArrivals.map(p => (
                    <div key={p.id} onClick={() => setSelectedProduct(p)} className="min-w-[200px] sm:min-w-[240px] bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <img src={p.image} className="w-full aspect-square object-cover rounded-2xl mb-4" alt={p.name} />
                      <h4 className="font-black text-slate-900 text-[10px] uppercase truncate">{p.name}</h4>
                      <p className="text-cyan-600 font-black text-sm">${new Intl.NumberFormat('es-CO').format(p.retailPrice)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                {Object.values(Category).map(cat => (
                  <button 
                    key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} whatsappPhone={whatsappPhone} onClick={setSelectedProduct} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} whatsappPhone={whatsappPhone} onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.min(i.stock, Math.max(1, i.quantity + d))} : i))} onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={finalizeSale} />
      <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onLogin={handleAdminLogin} onLogout={handleAdminLogout} isAdmin={isAdmin} />
      
      <footer className="bg-white py-16 text-center border-t border-slate-100 mt-20">
        <LogoHexagon className="w-12 h-12 grayscale opacity-20 mx-auto mb-4" />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Distribuciones In-Nova 2025</p>
      </footer>
    </div>
  );
};

export default App;
