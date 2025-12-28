
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'accounting' | 'sales' | 'settings'>('inventory');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const totalCost = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalSalesCost = sales.reduce((acc, s) => {
    return acc + s.items.reduce((itemAcc: number, item: any) => itemAcc + (item.cost * item.qty), 0);
  }, 0);
  const currentProfit = totalSalesRevenue - totalSalesCost;

  const compressAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Suficiente para alta calidad pero ligero
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Calidad 0.7 para balance perfecto entre peso y vista
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, product: Product, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(product.id);
    
    if (type === 'image') {
      const compressed = await compressAndResizeImage(file);
      onUpdateProduct({ ...product, image: compressed });
      setIsProcessing(null);
    } else {
      // Para videos mantenemos la lógica base
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateProduct({ ...product, videoUrl: event.target?.result as string });
        setIsProcessing(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Administración</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Gestiona tus productos y ventas</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['inventory', 'accounting', 'sales', 'settings'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
            >
              {tab === 'inventory' ? 'Inventario' : tab === 'accounting' ? 'Finanzas' : tab === 'sales' ? 'Ventas' : 'Ajustes'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <button 
            onClick={onAddProduct}
            className="w-full bg-cyan-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-cyan-600 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Agregar Nuevo Producto
          </button>
          
          <div className="grid grid-cols-1 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-48 h-48 rounded-3xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 group relative flex items-center justify-center">
                    {isProcessing === p.id ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                        <span className="text-[8px] font-black text-cyan-600 uppercase tracking-widest">Optimizando...</span>
                      </div>
                    ) : (
                      <>
                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <label className="bg-white p-3 rounded-xl cursor-pointer hover:bg-cyan-500 hover:text-white transition-colors shadow-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, p, 'image')} />
                           </label>
                        </div>
                      </>
                    )}
                    <button 
                      onClick={() => onDeleteProduct(p.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nombre</label>
                      <input 
                        type="text" value={p.name} 
                        onChange={(e) => onUpdateProduct({ ...p, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Categoría</label>
                      <select 
                        value={p.category}
                        onChange={(e) => onUpdateProduct({ ...p, category: e.target.value as Category })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                      >
                        {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Costo (Mayor)</label>
                      <input 
                        type="number" value={p.price} 
                        onChange={(e) => onUpdateProduct({ ...p, price: Number(e.target.value) })}
                        className="w-full bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-xs font-black text-emerald-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Venta (Detal)</label>
                      <input 
                        type="number" value={p.retailPrice} 
                        onChange={(e) => onUpdateProduct({ ...p, retailPrice: Number(e.target.value) })}
                        className="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-xs font-black text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Stock</label>
                      <input 
                        type="number" value={p.stock} 
                        onChange={(e) => onUpdateProduct({ ...p, stock: Number(e.target.value) })}
                        className="w-full bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3 text-xs font-black text-cyan-600 outline-none"
                      />
                    </div>
                    <div className="flex gap-4 items-center pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded text-cyan-600" checked={p.isNew} onChange={(e) => onUpdateProduct({ ...p, isNew: e.target.checked })} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nuevo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded text-amber-600" checked={p.isCombo} onChange={(e) => onUpdateProduct({ ...p, isCombo: e.target.checked })} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Combo</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Descripción del Producto</label>
                  <textarea 
                    value={p.description} 
                    rows={2}
                    onChange={(e) => onUpdateProduct({ ...p, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'accounting' && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inversión en Inventario</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">${new Intl.NumberFormat('es-CO').format(totalCost)}</h3>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Totales</p>
              <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">${new Intl.NumberFormat('es-CO').format(totalSalesRevenue)}</h3>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl text-center">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Utilidad Bruta</p>
              <h3 className="text-4xl font-black tracking-tighter">${new Intl.NumberFormat('es-CO').format(currentProfit)}</h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Historial de Transacciones</h3>
             <button onClick={onClearSales} className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition-all">Vaciar Historial</button>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Items</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">Sin registros de ventas</td></tr>
                ) : (
                  sales.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">{new Date(s.date).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {s.items.map((i: any, idx: number) => <p key={idx} className="text-[9px] font-black text-slate-700 uppercase">{i.qty}x {i.name}</p>)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 whitespace-nowrap">${new Intl.NumberFormat('es-CO').format(s.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md mx-auto space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl animate-in slide-in-from-bottom duration-500">
          <div className="text-center space-y-2">
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ajustes Generales</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configura la experiencia del cliente</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp de Pedidos</label>
              <input 
                type="text" value={whatsappPhone} 
                onChange={(e) => onUpdateSettings(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Ej: 573206064030"
              />
              <p className="text-[9px] text-slate-400 italic text-center">Incluye el código de país sin el símbolo '+'</p>
            </div>
            
            <div className="pt-6 border-t border-slate-50 text-center">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">In-Nova Distribuciones v2.5</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
