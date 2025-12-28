
import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  whatsappPhone: string;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, whatsappPhone, onUpdateQuantity, onRemove, onCheckout }) => {
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

    onCheckout();
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
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
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Tu Pedido</h2>
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
                <p className="text-slate-900 font-black uppercase tracking-widest text-sm">Carrito Vacío</p>
              </div>
            ) : (
              items.map((item) => {
                const isWholesale = item.quantity >= 5;
                const currentPrice = getItemCurrentPrice(item);
                return (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[11px] font-black text-slate-900 uppercase truncate mb-1">{item.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isWholesale ? 'text-emerald-600' : 'text-cyan-600'}`}>
                          {formatPrice(currentPrice)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg></button>
                          <span className="w-6 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
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
            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Forma de Pago</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['Nequi', 'Bancolombia', 'Contraentrega'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as any)}
                      className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${paymentMethod === method ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatPrice(subtotal)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-center shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
              >
                Finalizar Pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
