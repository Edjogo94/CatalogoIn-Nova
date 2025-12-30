
import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';

interface AdminDashboardProps {
  products: Product[];
  sales: any[];
  whatsappPhone: string;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (phone: string, sheetUrl: string) => void;
  onClearSales: () => void;
  onSyncToCloud: () => Promise<boolean>;
  sheetUrl: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, sales, whatsappPhone, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateSettings, onClearSales, onSyncToCloud, sheetUrl
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'accounting' | 'sales' | 'settings'>('inventory');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Estados para retroalimentación visual (Semaforo)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [settingsStatus, setSettingsStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const [localSheetUrl, setLocalSheetUrl] = useState(sheetUrl);
  const [localPhone, setLocalPhone] = useState(whatsappPhone);

  useEffect(() => {
    setLocalPhone(whatsappPhone);
  }, [whatsappPhone]);

  useEffect(() => {
    setLocalSheetUrl(sheetUrl);
  }, [sheetUrl]);

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
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve(img.src);
          }
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
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateProduct({ ...product, videoUrl: event.target?.result as string });
        setIsProcessing(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSync = async () => {
    if (!sheetUrl) {
      alert("Configura primero la URL del Google Script en Ajustes");
      setActiveTab('settings');
      return; 
    }
    
    if (!confirm("Se enviará TODO el inventario actual a la nube. ¿Continuar?")) return;
    
    setSyncStatus('syncing');
    try {
      const success = await onSyncToCloud();
      if (success) {
        setSyncStatus('success');
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleSaveSettings = () => {
    setSettingsStatus('saving');
    setTimeout(() => {
      onUpdateSettings(localPhone, localSheetUrl);
      setSettingsStatus('success');
      setTimeout(() => setSettingsStatus('idle'), 2000);
    }, 600);
  }

  const downloadCSV = () => {
    const headers = ['ID', 'Nombre', 'Link Imagen', 'Categoria', 'Costo Proveedor', 'Costo (Mayor)', 'Venta (Detal)', 'Stock', 'Descripcion', 'EsNuevo', 'EsCombo'];
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.image}"`,
      p.category,
      p.supplierCost || 0,
      p.price,
      p.retailPrice,
      p.stock,
      `"${p.description.replace(/"/g, '""')}"`,
      p.isNew ? 'Si' : 'No',
      p.isCombo ? 'Si' : 'No'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventario_InNova_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const calculateSuggestedWholesale = (cost: number) => {
    // Fórmula: (Valor Compra + 1100) * 1.15
    return Math.ceil(((cost + 1100) * 1.15) / 100) * 100; // Redondeado a la centena más cercana para mejor estética
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
          <div className="flex gap-4 flex-col sm:flex-row">
            <button 
              onClick={onAddProduct}
              className="flex-1 bg-cyan-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-cyan-600 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              Nuevo
            </button>
            
            <button 
              onClick={downloadCSV}
              className="bg-white text-slate-700 border border-slate-200 py-5 px-8 rounded-3xl font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              CSV
            </button>

            <button 
              onClick={handleManualSync}
              disabled={syncStatus !== 'idle' || !sheetUrl}
              className={`px-8 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 border ${
                syncStatus === 'success' ? 'bg-emerald-500 text-white border-emerald-500 scale-105' :
                syncStatus === 'error' ? 'bg-red-500 text-white border-red-500' :
                !sheetUrl ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 
                'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
            >
              {syncStatus === 'syncing' && (
                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              )}
              {syncStatus === 'success' && (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              )}
              {syncStatus === 'error' && (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              {syncStatus === 'idle' && (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              )}
              
              {syncStatus === 'idle' ? 'Subir a Nube' : 
               syncStatus === 'syncing' ? 'Subiendo...' : 
               syncStatus === 'success' ? '¡Listo!' : 'Error'}
            </button>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Imagen</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Link Imagen</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[200px]">Info Producto</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Costo Proveedor</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Costo (Mayor)</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Venta (Detal)</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Etiquetas</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => {
                  const suggestedWholesale = calculateSuggestedWholesale(p.supplierCost || 0);
                  return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 align-top w-20">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden group/img cursor-pointer shrink-0">
                        {isProcessing === p.id ? (
                           <div className="absolute inset-0 flex items-center justify-center bg-white/80"><div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-500 border-t-transparent"></div></div>
                        ) : (
                           <>
                             <img src={p.image} className="w-full h-full object-cover" alt="Thumb" />
                             <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, p, 'image')} />
                               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             </label>
                           </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <input 
                        type="text" 
                        value={p.image} 
                        onChange={(e) => onUpdateProduct({ ...p, image: e.target.value })}
                        className="w-24 bg-slate-50 border-b border-transparent focus:border-cyan-500 text-[9px] text-slate-500 focus:w-48 transition-all outline-none truncate focus:text-slate-900"
                        placeholder="https://..."
                      />
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" value={p.name} 
                          onChange={(e) => onUpdateProduct({ ...p, name: e.target.value })}
                          className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 rounded-none px-0 py-1 text-xs font-black text-slate-900 outline-none transition-colors placeholder-slate-300"
                          placeholder="Nombre del producto"
                        />
                        <textarea 
                          value={p.description} 
                          onChange={(e) => onUpdateProduct({ ...p, description: e.target.value })}
                          className="w-full bg-transparent border border-transparent focus:border-slate-200 rounded-lg p-2 text-[10px] font-medium text-slate-500 outline-none resize-none h-12 transition-colors"
                          placeholder="Descripción corta..."
                        />
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <select 
                        value={p.category}
                        onChange={(e) => onUpdateProduct({ ...p, category: e.target.value as Category })}
                        className="w-full bg-slate-50 border border-transparent focus:border-cyan-500 rounded-lg px-2 py-2 text-[10px] font-bold outline-none cursor-pointer"
                      >
                        {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 align-top">
                      <div className="relative">
                         <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-400">$</span>
                         <input 
                          type="number" value={p.supplierCost || 0} 
                          onChange={(e) => onUpdateProduct({ ...p, supplierCost: Number(e.target.value) })}
                          className="w-20 bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-2 py-2 text-xs font-black text-slate-500 outline-none focus:ring-2 focus:ring-slate-500/20"
                        />
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="relative flex flex-col gap-1">
                        <div className="relative">
                           <span className="absolute left-2 top-2 text-[10px] font-bold text-emerald-600">$</span>
                           <input 
                            type="number" value={p.price} 
                            onChange={(e) => onUpdateProduct({ ...p, price: Number(e.target.value) })}
                            className="w-24 bg-emerald-50/50 border border-emerald-100 rounded-lg pl-4 pr-2 py-2 text-xs font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <button 
                          onClick={() => onUpdateProduct({ ...p, price: suggestedWholesale })}
                          className="text-[8px] font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-md hover:bg-cyan-100 transition-colors w-fit text-left"
                          title="Clic para aplicar precio sugerido"
                        >
                          Sugerido: ${suggestedWholesale}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                       <div className="relative">
                         <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-400">$</span>
                         <input 
                          type="number" value={p.retailPrice} 
                          onChange={(e) => onUpdateProduct({ ...p, retailPrice: Number(e.target.value) })}
                          className="w-20 bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-2 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <input 
                        type="number" value={p.stock} 
                        onChange={(e) => onUpdateProduct({ ...p, stock: Number(e.target.value) })}
                        className="w-14 bg-cyan-50/50 border border-cyan-100 rounded-lg px-2 py-2 text-xs font-black text-cyan-700 outline-none text-center focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none group/chk">
                          <input type="checkbox" className="w-3 h-3 rounded text-cyan-600 accent-cyan-500" checked={p.isNew || false} onChange={(e) => onUpdateProduct({ ...p, isNew: e.target.checked })} />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover/chk:text-cyan-600 transition-colors">Nuevo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none group/chk">
                          <input type="checkbox" className="w-3 h-3 rounded text-amber-600 accent-amber-500" checked={p.isCombo || false} onChange={(e) => onUpdateProduct({ ...p, isCombo: e.target.checked })} />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover/chk:text-amber-600 transition-colors">Combo</span>
                        </label>
                      </div>
                    </td>
                    <td className="p-4 align-top text-center">
                       <button 
                        onClick={() => onDeleteProduct(p.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Eliminar producto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
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
                type="text" value={localPhone} 
                onChange={(e) => setLocalPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Ej: 573206064030"
              />
              <p className="text-[9px] text-slate-400 italic text-center">Incluye el código de país sin el símbolo '+'</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-50">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Conexión Google Sheets</label>
              <input 
                type="text" value={localSheetUrl} 
                onChange={(e) => setLocalSheetUrl(e.target.value)}
                className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-5 text-xs font-medium text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="https://script.google.com/macros/s/..."
              />
              <p className="text-[9px] text-slate-400 italic text-center">URL de la App Web desplegada en Google Apps Script</p>
            </div>
            
            <button 
              onClick={handleSaveSettings}
              disabled={settingsStatus !== 'idle'}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 ${
                settingsStatus === 'success' ? 'bg-emerald-500 text-white scale-105' :
                'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
               {settingsStatus === 'saving' && (
                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              )}
              {settingsStatus === 'success' && (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              )}
              
              {settingsStatus === 'idle' ? 'Guardar Cambios' : 
               settingsStatus === 'saving' ? 'Guardando...' : 
               '¡Cambios Guardados!'}
            </button>
            
            <div className="pt-6 border-t border-slate-50 text-center">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">In-Nova Distribuciones v2.6</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
