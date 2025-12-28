
import React, { useState } from 'react';
import { Product } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleIncrement = () => setQuantity(q => Math.min(product.stock, q + 1));
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  const isWholesale = quantity >= 5;
  const currentUnitPrice = isWholesale ? product.price : product.retailPrice;
  const totalPrice = currentUnitPrice * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur rounded-full p-2.5 hover:bg-slate-100 transition-all shadow-sm border border-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="md:w-1/2 h-72 md:h-auto bg-slate-50 relative group">
          {product.videoUrl ? (
            <video 
              src={product.videoUrl} 
              autoPlay 
              loop 
              muted={isVideoPlaying}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          )}
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2 z-10">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                {isWholesale && (
                  <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg animate-bounce w-fit">
                    ¡Precio Mayorista Aplicado!
                  </div>
                )}
                <div className="bg-slate-900/80 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest backdrop-blur-sm shadow-lg w-fit">
                  Unidades disponibles: {product.stock}
                </div>
              </div>
              
              {product.videoUrl && (
                 <button 
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  className="bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg hover:bg-cyan-500 hover:text-white transition-all"
                 >
                   {isVideoPlaying ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                   ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                   )}
                 </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${CATEGORY_COLORS[product.category] || 'bg-slate-100 text-slate-500'}`}>
              {product.category}
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-3 leading-tight uppercase tracking-tight">{product.name}</h2>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {isWholesale ? 'Precio Mayorista' : 'Precio al Detal'}
              </span>
              <div className="flex flex-col items-end">
                <span className={`text-2xl font-black ${isWholesale ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {formatPrice(currentUnitPrice)}
                </span>
                {!isWholesale && product.stock >= 5 && (
                  <span className="text-[9px] font-bold text-slate-400 mt-1 italic">Lleva 5 o más para precio mayorista</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cantidad</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                <button 
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all rounded-xl disabled:opacity-30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                </button>
                <span className="w-12 text-center font-black text-lg text-slate-900">{quantity}</span>
                <button 
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all rounded-xl disabled:opacity-30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Total</p>
                <p className={`text-4xl font-black tracking-tighter ${isWholesale ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {formatPrice(totalPrice)}
                </p>
              </div>
              {isWholesale && (
                <div className="text-right pb-1">
                  <span className="text-[9px] font-black text-emerald-500 uppercase line-through opacity-50">
                    {formatPrice(product.retailPrice * quantity)}
                  </span>
                </div>
              )}
            </div>

            <button 
              onClick={() => onAddToCart(product, quantity)}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-center shadow-xl shadow-slate-200 hover:bg-cyan-600 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Agregar al Carrito
            </button>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Descripción</h4>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
