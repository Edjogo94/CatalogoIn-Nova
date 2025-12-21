
import React, { useState } from 'react';
import { CartItem } from '../types';
import { WHATSAPP_PHONE } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }) => {
  const [paymentMethod, setPaymentMethod] = useState<'Nequi' | 'Bancolombia' | 'Contraentrega'>('Nequi');

  const getItemCurrentPrice = (item: CartItem) => {
    return item.quantity >= 5 ? item.price : item.retailPrice;
  };

  const subtotal = items.reduce((acc, item) => acc + (getItemCurrentPrice(item) * item.quantity), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = () => {
    const productList = items.map(item => {
      const currentPrice = getItemCurrentPrice(item);
      const wholesaleTag = item.quantity >= 5 ? ' (MAYORISTA)' : '';
      return `- ${item.name} (${item.quantity} und) x ${formatPrice(currentPrice)}${wholesaleTag}`;
    }).join('\n');

    const message = `¡Hola! 👋 Quiero realizar el siguiente pedido:

*Productos:*
${productList}

*Total a Pagar:* ${formatPrice(subtotal)}
*Método de Pago:* ${paymentMethod}

¿Me confirman disponibilidad y datos de envío?`;

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-2 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Tu Carrito</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="bg-slate-50 p-8 rounded-full">
                  <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-900 font-black uppercase tracking-widest text-sm">Tu carrito está vacío</p>
                  <p className="text-slate-400 text-xs font-medium px-10">Parece que aún no has añadido ninguna innovación a tu pedido.</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-cyan-600 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Seguir Comprando
                </button>
              </div>
            ) : (
              items.map((item) => {
                const isWholesale = item.quantity >= 5;
                const currentPrice = getItemCurrentPrice(item);
                return (
                  <div key={item.id} className="flex gap-4 group animate-fade-in">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase truncate pr-4 tracking-wider">{item.name}</h3>
                        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isWholesale ? 'text-emerald-600' : 'text-cyan-600'}`}>
                          {formatPrice(currentPrice)}
                        </p>
                        {isWholesale && (
                          <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter animate-pulse">
                            Mayorista
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5 shadow-inner">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:text-cyan-600 transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg></button>
                          <span className="w-6 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:text-cyan-600 transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
                        </div>
                        <span className="text-[11px] font-black text-slate-900">{formatPrice(currentPrice * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Método de Pago</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['Nequi', 'Bancolombia', 'Contraentrega'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as any)}
                      className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${paymentMethod === method ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Estimado</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatPrice(subtotal)}</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-center shadow-xl shadow-slate-200 hover:bg-cyan-600 transition-all active:scale-95 uppercase tracking-[0.15em] flex items-center justify-center gap-3 text-sm"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.52.909 3.033 1.389 4.625 1.39h.005c5.454 0 9.893-4.439 9.896-9.895.001-2.646-1.03-5.131-2.903-7.005-1.872-1.873-4.359-2.904-7.006-2.905-5.454 0-9.894 4.439-9.897 9.896-.001 1.83.515 3.568 1.492 5.044l-.991 3.62 3.71-.973c1.4.766 2.822 1.137 4.069 1.137zm11.332-6.57c-.066-.109-.242-.175-.506-.307-.264-.132-1.562-.771-1.804-.858-.242-.088-.418-.132-.594.132-.176.264-.682.858-.836 1.034-.154.176-.308.198-.572.066-.264-.132-1.117-.412-2.126-1.314-.786-.701-1.317-1.566-1.471-1.83-.154-.264-.016-.407.116-.539.118-.118.264-.308.396-.462.132-.154.176-.264.264-.44.088-.176.044-.33-.022-.462-.066-.132-.594-1.43-.814-1.958-.214-.515-.429-.444-.594-.452-.154-.008-.33-.01-.506-.01-.176 0-.462.066-.704.33-.242.264-.924.902-.924 2.199 0 1.297.946 2.552 1.078 2.728.132.176 1.861 2.842 4.508 3.982.63.27 1.121.43 1.505.553.633.201 1.208.173 1.662.105.507-.076 1.562-.638 1.782-1.254.22-.616.22-1.144.154-1.254z"/></svg>
                  Confirmar Pedido
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-white text-slate-500 py-4 rounded-2xl font-black text-center border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Seguir Comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
