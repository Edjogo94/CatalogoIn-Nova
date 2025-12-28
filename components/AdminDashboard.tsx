
import React, { useState, useRef } from 'react';
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, product: Product, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(product.id);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'image') {
        onUpdateProduct({ ...product, image: result });
      } else {
        onUpdateProduct({ ...product, videoUrl: result });
      }
      setIsProcessing(null);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Gestión Total</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Control maestro de la plataforma</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['inventory', 'accounting', 'sales', 'settings'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
            >
              {tab === 'inventory' ? 'Inventario' : tab === 'accounting' ? 'Finanzas' : tab === 'sales' ? 'Historial' : 'Ajustes'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <button 
            onClick={onAddProduct}
            className="w-full bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Agregar Nuevo Producto
          </button>
          
          <div className="grid grid-cols-1 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-48 h-48 rounded-3xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 group relative flex items-center justify-center">
                    {isProcessing === p.id ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                    ) : (
                      <>
                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <label className="bg-white p-2 rounded-xl cursor-pointer hover:bg-cyan-500 hover:text-white transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, p, 'image')} />
                           </label>
                           <label className="bg-white p-2 rounded-xl cursor-pointer hover:bg-cyan-500 hover:text-white transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, p, 'video')} />
                           </label>
                        </div>
                      </>
                    )}
                    <button 
                      onClick={() => onDeleteProduct(p.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Multimedia URL</label>
                      <div className="flex gap-2">
                         <input 
                            type="text" value={p.image.substring(0, 30) + '...'} 
                            disabled
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] outline-none opacity-50"
                         />
                         {p.videoUrl && (
                            <div className="bg-cyan-500 text-white p-3 rounded-xl">
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </div>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Descripción</label>
                  <textarea 
                    value={p.description} 
                    rows={2}
                    onChange={(e) => onUpdateProduct({ ...p, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium outline-none resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={p.isNew} onChange={(e) => onUpdateProduct({ ...p, isNew: e.target.checked })} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nuevo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={p.isCombo} onChange={(e) => onUpdateProduct({ ...p, isCombo: e.target.checked })} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Combo</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'accounting' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inversión Actual</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">${new Intl.NumberFormat('es-CO').format(totalCost)}</h3>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Históricas</p>
              <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">${new Intl.NumberFormat('es-CO').format(totalSalesRevenue)}</h3>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Ganancia Neta</p>
              <h3 className="text-4xl font-black tracking-tighter">${new Intl.NumberFormat('es-CO').format(currentProfit)}</h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="flex justify-end">
             <button onClick={onClearSales} className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline">Limpiar Historial</button>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Pedido</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Items</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">Sin ventas</td></tr>
                ) : (
                  sales.map(s => (
                    <tr key={s.id}>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{new Date(s.date).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {s.items.map((i: any, idx: number) => <p key={idx} className="text-[9px] font-black text-slate-700 uppercase">{i.qty}x {i.name}</p>)}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">${new Intl.NumberFormat('es-CO').format(s.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-md mx-auto space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter text-center">Configuración General</h4>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp de Pedidos</label>
              <input 
                type="text" value={whatsappPhone} 
                onChange={(e) => onUpdateSettings(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Ej: 57320..."
              />
              <p className="text-[9px] text-slate-400 italic">Código de país incluido (ej: 57 para Colombia)</p>
            </div>
          </div>
          <div className="p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
             <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest leading-relaxed text-center">
               Cualquier cambio aquí se aplica instantáneamente en el catálogo para tus clientes.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
