
import React, { useState } from 'react';
import { Product, Category } from '../types';

interface AdminDashboardProps {
  products: Product[];
  sales: any[];
  whatsappPhone: string;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (phone: string) => void;
  onClearSales: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, sales, whatsappPhone, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateSettings, onClearSales 
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'accounting' | 'sync' | 'settings'>('inventory');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const totalCost = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  const compressAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; 
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.55));
        };
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, product: Product) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(product.id);
    const compressed = await compressAndResizeImage(file);
    onUpdateProduct({ ...product, image: compressed });
    setIsProcessing(null);
  };

  const generateSyncCode = () => {
    // Los productos se exportan tal como están en el estado actual
    const names = JSON.stringify(products.map(p => p.name), null, 2);
    const descriptions = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.description }), {}), null, 2);
    const prices = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.price }), {}), null, 2);
    const retailPrices = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.retailPrice }), {}), null, 2);
    const stocks = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.stock }), {}), null, 2);
    const assets = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: { image: p.image, video: p.videoUrl } }), {}), null, 2);
    
    // Nueva constante para guardar las categorías seleccionadas por el usuario
    const categories = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.category }), {}), null, 2);

    return `// COPIA TODO ESTE CÓDIGO Y PÉGALO EN TU ARCHIVO constants.ts EN GITHUB
// ESTO GUARDARÁ PERMANENTEMENTE TUS PRODUCTOS NUEVOS Y MODIFICADOS.

export const WHATSAPP_PHONE = "${whatsappPhone}";

export const RAW_PRODUCT_NAMES = ${names};

export const PRODUCT_DESCRIPTIONS: Record<string, string> = ${descriptions};

export const PRODUCT_PRICES: Record<string, number> = ${prices};

export const PRODUCT_RETAIL_PRICES: Record<string, number> = ${retailPrices};

export const PRODUCT_STOCK: Record<string, number> = ${stocks};

export const PRODUCT_ASSETS: Record<string, { image?: string; video?: string }> = ${assets};

// Categorías asignadas manualmente
export const PRODUCT_CUSTOM_CATEGORIES: Record<string, string> = ${categories};
`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("¡Código generado y copiado! Ahora ve a GitHub, abre constants.ts y pega esto allí.");
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Panel de Gestión</h2>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest italic">Administra el inventario y sincroniza cambios</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['inventory', 'accounting', 'sync', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>
              {tab === 'inventory' ? 'Productos' : tab === 'accounting' ? 'Finanzas' : tab === 'sync' ? 'Sincronizar GitHub' : 'Ajustes'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <button onClick={onAddProduct} className="w-full bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Agregar Producto Nuevo
          </button>
          
          <div className="grid grid-cols-1 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 group relative flex items-center justify-center mx-auto sm:mx-0">
                  {isProcessing === p.id ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent" />
                  ) : (
                    <>
                      <img src={p.image} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, p)} />
                      </label>
                    </>
                  )}
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <input type="text" value={p.name} onChange={(e) => onUpdateProduct({ ...p, name: e.target.value })} className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-xs font-black uppercase tracking-tight focus:ring-1 focus:ring-cyan-500/20" />
                    <select value={p.category} onChange={(e) => onUpdateProduct({ ...p, category: e.target.value as Category })} className="w-full bg-slate-50 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {Object.values(Category).filter(c => c !== Category.ALL).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <textarea value={p.description} rows={2} onChange={(e) => onUpdateProduct({ ...p, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-[10px] font-medium resize-none" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-400 uppercase">Costo Mayor</span>
                      <input type="number" value={p.price} onChange={(e) => onUpdateProduct({ ...p, price: Number(e.target.value) })} className="bg-emerald-50 text-emerald-600 font-black px-2 py-1 rounded-md text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-400 uppercase">Venta Detal</span>
                      <input type="number" value={p.retailPrice} onChange={(e) => onUpdateProduct({ ...p, retailPrice: Number(e.target.value) })} className="bg-slate-900 text-white font-black px-2 py-1 rounded-md text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-400 uppercase">Stock</span>
                      <input type="number" value={p.stock} onChange={(e) => onUpdateProduct({ ...p, stock: Number(e.target.value) })} className="bg-cyan-50 text-cyan-600 font-black px-2 py-1 rounded-md text-xs" />
                    </div>
                    <button onClick={() => onDeleteProduct(p.id)} className="text-[8px] font-black uppercase text-red-500 hover:underline mt-1">Borrar Producto</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-cyan-50 border border-cyan-100 p-6 rounded-3xl">
            <h3 className="text-cyan-900 font-black text-sm uppercase mb-2">💾 Sincronización Permanente</h3>
            <p className="text-cyan-800 text-[10px] leading-relaxed font-medium">
              Los cambios que haces aquí son "temporales" (viven en la memoria de este navegador). Para que se vuelvan **OFICIALES** en tu página para todos los clientes, sigue estos pasos:
              <br/><br/>
              1. Haz clic en <b>"Copiar Código Fuente"</b>.<br/>
              2. Ve a tu repositorio en GitHub.<br/>
              3. Abre el archivo <code>constants.ts</code>.<br/>
              4. Borra todo lo que hay allí y pega el nuevo código.<br/>
              5. Guarda los cambios (Commit).
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-cyan-400 text-[8px] font-black uppercase tracking-widest">Vista Previa de constants.ts</span>
              <button onClick={() => copyToClipboard(generateSyncCode())} className="bg-cyan-500 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg hover:bg-cyan-600 active:scale-95 transition-all">Copiar Código Fuente</button>
            </div>
            <pre className="text-white/40 text-[7px] font-mono overflow-auto max-h-[400px] p-4 bg-black/30 rounded-xl leading-relaxed">
              {generateSyncCode()}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'accounting' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valor de tu Inventario</p>
            <h3 className="text-3xl font-black text-slate-900">${new Intl.NumberFormat('es-CO').format(totalCost)}</h3>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white text-center shadow-xl">
            <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Ventas Registradas</p>
            <h3 className="text-3xl font-black text-white">${new Intl.NumberFormat('es-CO').format(totalSalesRevenue)}</h3>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h4 className="text-center text-[10px] font-black uppercase text-slate-400">Configuración de Contacto</h4>
          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">WhatsApp de Pedidos</label>
            <input type="text" value={whatsappPhone} onChange={(e) => onUpdateSettings(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-black text-slate-900" />
          </div>
          <p className="text-[8px] text-slate-400 text-center italic">Recuerda incluir el código de país (Ej: 57 para Colombia).</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
