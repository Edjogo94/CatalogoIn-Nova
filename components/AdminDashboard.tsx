
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
  onSoftRefresh: () => void; // Nueva prop para refrescar estado sin reload
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, sales, whatsappPhone, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateSettings, onClearSales, onSoftRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'accounting' | 'sync' | 'settings'>('inventory');
  const [adminSearch, setAdminSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleMasterSave = () => {
    try {
      localStorage.setItem('innova_full_db_v3_master', JSON.stringify(products));
      localStorage.setItem('innova_settings_v3', JSON.stringify({ phone: whatsappPhone }));
      
      // En lugar de window.location.reload(), usamos el refresco suave de la App
      onSoftRefresh();
      alert("¡Cambios aplicados con éxito!");
    } catch (e) {
      alert("Límite excedido: No se pudo guardar. Borra algunas fotos subidas manualmente para liberar espacio.");
    }
  };

  const totalCost = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  const filteredAdminProducts = products.filter(p => 
    p.name.toLowerCase().includes(adminSearch.toLowerCase())
  );

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
          resolve(canvas.toDataURL('image/jpeg', 0.5)); 
        };
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, product: Product) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(product.id);
    try {
      const compressed = await compressAndResizeImage(file);
      onUpdateProduct({ ...product, image: compressed });
    } catch (e) {
      alert("Error al procesar la imagen.");
    } finally {
      setIsProcessing(null);
    }
  };

  const generateSyncCode = () => {
    const names = JSON.stringify(products.map(p => p.name), null, 2);
    const descriptions = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.description }), {}), null, 2);
    const prices = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.price }), {}), null, 2);
    const retailPrices = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.retailPrice }), {}), null, 2);
    const stocks = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.stock }), {}), null, 2);
    const assets = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: { image: p.image, video: p.videoUrl } }), {}), null, 2);
    const categories = JSON.stringify(products.reduce((acc, p) => ({ ...acc, [p.name]: p.category }), {}), null, 2);

    return `// CÓDIGO DE RESPALDO PARA constants.ts
export const WHATSAPP_PHONE = "${whatsappPhone}";
export const RAW_PRODUCT_NAMES = ${names};
export const PRODUCT_DESCRIPTIONS: Record<string, string> = ${descriptions};
export const PRODUCT_PRICES: Record<string, number> = ${prices};
export const PRODUCT_RETAIL_PRICES: Record<string, number> = ${retailPrices};
export const PRODUCT_STOCK: Record<string, number> = ${stocks};
export const PRODUCT_ASSETS: Record<string, { image?: string; video?: string }> = ${assets};
export const PRODUCT_CUSTOM_CATEGORIES: Record<string, string> = ${categories};
`;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Administrador In-Nova</h2>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest italic mt-1">Gestión avanzada de inventario</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={handleMasterSave}
            className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            Aplicar Cambios
          </button>
          
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
            {(['inventory', 'accounting', 'sync', 'settings'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>
                {tab === 'inventory' ? `Productos` : tab === 'accounting' ? 'Dinero' : tab === 'sync' ? 'Back-up' : 'Ajustes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <button onClick={onAddProduct} className="flex-1 bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              Añadir Producto
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
              <svg className="absolute left-4 top-4 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredAdminProducts.map(p => (
              <div key={p.id} className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-md flex flex-col gap-6 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-cyan-500 transition-all"></div>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-40 h-40 rounded-3xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 relative flex items-center justify-center mx-auto lg:mx-0">
                    {isProcessing === p.id ? <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" /> : (
                      <>
                        <img src={p.image} className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, p)} />
                        </label>
                      </>
                    )}
                  </div>

                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre del Producto</label>
                        <input type="text" value={p.name} onChange={(e) => onUpdateProduct({ ...p, name: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase text-slate-900 focus:ring-1 focus:ring-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Categoría</label>
                        <select value={p.category} onChange={(e) => onUpdateProduct({ ...p, category: e.target.value as Category })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-black text-slate-600 outline-none">
                          {Object.values(Category).filter(c => c !== Category.ALL).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Costo Mayorista</label>
                        <input type="number" value={p.price} onChange={(e) => onUpdateProduct({ ...p, price: Number(e.target.value) })} className="w-full bg-emerald-50 text-emerald-600 font-black px-4 py-3 rounded-xl text-xs outline-none" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-slate-900 uppercase tracking-widest block mb-1">Venta Detal</label>
                        <input type="number" value={p.retailPrice} onChange={(e) => onUpdateProduct({ ...p, retailPrice: Number(e.target.value) })} className="w-full bg-slate-100 text-slate-900 font-black px-4 py-3 rounded-xl text-xs outline-none" />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-cyan-600 uppercase tracking-widest block mb-1">Existencias</label>
                        <input type="number" value={p.stock} onChange={(e) => onUpdateProduct({ ...p, stock: Number(e.target.value) })} className="w-full bg-cyan-50 text-cyan-600 font-black px-4 py-3 rounded-xl text-xs outline-none" />
                      </div>
                      <div className="flex flex-col justify-center gap-1.5 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={p.isNew} onChange={(e) => onUpdateProduct({...p, isNew: e.target.checked})} className="w-3 h-3 rounded text-cyan-500" />
                          <span className="text-[8px] font-black uppercase text-slate-500">Destacado</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={p.isCombo} onChange={(e) => onUpdateProduct({...p, isCombo: e.target.checked})} className="w-3 h-3 rounded text-amber-500" />
                          <span className="text-[8px] font-black uppercase text-slate-500">Combo</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Descripción Breve</label>
                      <textarea value={p.description} rows={3} onChange={(e) => onUpdateProduct({ ...p, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-[10px] font-medium resize-none outline-none" />
                      <button onClick={() => onDeleteProduct(p.id)} className="w-full mt-2 text-[8px] font-black uppercase text-red-500 hover:bg-red-50 py-2 rounded-lg transition-all">Eliminar Producto</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
              <h3 className="text-cyan-400 font-black text-sm uppercase mb-4">Exportar Base de Datos</h3>
              <p className="text-slate-400 text-[10px] mb-6">Genera un código de respaldo para actualizar tu constants.ts manualmente.</p>
              <button onClick={() => { navigator.clipboard.writeText(generateSyncCode()); alert("¡Código copiado!")}} className="w-full bg-cyan-500 py-4 rounded-xl text-[10px] font-black uppercase active:scale-95">Copiar Código</button>
            </div>
            <div className="bg-white border border-slate-100 p-8 rounded-[2rem]">
              <h3 className="text-slate-900 font-black text-sm uppercase mb-4">Resetear Aplicación</h3>
              <p className="text-slate-400 text-[10px] mb-6">Borra todos los cambios locales y vuelve a los productos originales del archivo constants.ts.</p>
              <button onClick={() => { if(confirm("¿Restaurar todo? Perderás tus cambios manuales.")) { localStorage.removeItem('innova_full_db_v3_master'); onSoftRefresh(); } }} className="w-full bg-slate-100 text-slate-500 py-4 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 hover:text-red-500 transition-all">Limpiar y Restaurar</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accounting' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor Total Inventario</p>
            <h3 className="text-4xl font-black text-slate-900">${new Intl.NumberFormat('es-CO').format(totalCost)}</h3>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white text-center shadow-xl">
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Pedidos Realizados</p>
            <h3 className="text-4xl font-black text-white">${new Intl.NumberFormat('es-CO').format(totalSalesRevenue)}</h3>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="text-center mb-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ajustes del Catálogo</h4>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-1 mb-2">Número WhatsApp de Pedidos</label>
            <input type="text" value={whatsappPhone} onChange={(e) => onUpdateSettings(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-900 shadow-inner outline-none" />
          </div>
          <button onClick={onClearSales} className="w-full text-red-500 text-[9px] font-black uppercase border-2 border-red-50 py-4 rounded-xl hover:bg-red-50 transition-all">Limpiar Historial de Ventas</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
