
import React, { useState } from 'react';
import { Product } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ProductCardProps {
  product: Product;
  whatsappPhone: string;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, whatsappPhone, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `¡Hola! 👋 Me interesa la *${product.name}*\n📦 Precio Detal: ${formatPrice(product.retailPrice)}\n💰 Precio Mayor: ${formatPrice(product.price)} (Desde 5 unidades)\n¿Tienen disponibilidad?`;
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div 
      onClick={() => onClick(product)}
      className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 cursor-pointer flex flex-col h-full relative"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <img 
          src={imgError ? FALLBACK : product.image} 
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.isCombo && <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">Combo</span>}
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${CATEGORY_COLORS[product.category] || 'bg-white text-slate-600'}`}>
            {product.category}
          </span>
        </div>
        <button onClick={handleWhatsApp} className="absolute bottom-5 right-5 bg-white text-slate-900 p-3 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-white z-20">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.069l-.669 2.455 2.511-.659c.748.408 1.742.714 2.888.715 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zM15.512 14.659c-.133.373-.775.688-1.071.733-.296.044-.593.067-.889.022-.296-.045-1.554-.492-2.92-1.712-1.066-.95-1.785-2.122-1.992-2.478-.207-.356-.022-.549.155-.726.159-.159.356-.415.534-.623.178-.208.237-.356.356-.593.118-.237.059-.445-.03-.623-.089-.178-.775-1.875-1.062-2.56-.279-.667-.565-.575-.775-.586h-.662c-.237 0-.623.089-.95.445-.326.356-1.246 1.217-1.246 2.967 0 1.751 1.275 3.441 1.453 3.678.178.237 2.508 3.832 6.075 5.373.849.367 1.512.587 2.029.75.852.271 1.628.233 2.241.142.684-.102 2.099-.858 2.396-1.688.297-.83.297-1.542.208-1.689-.089-.147-.326-.236-.653-.394z"/></svg>
        </button>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-black text-slate-900 text-lg mb-1 uppercase tracking-tight truncate">{product.name}</h3>
        <p className="text-slate-400 text-[11px] mb-6 line-clamp-2 italic font-medium">{product.description}</p>
        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Precio Detal</span>
            <span className="text-xl font-black text-slate-900 tracking-tighter">{formatPrice(product.retailPrice)}</span>
          </div>
          <div className="flex justify-between items-center bg-emerald-50/50 px-3 py-2 rounded-xl border border-emerald-100">
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Al por Mayor</span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase">desde 5 und</span>
            </div>
            <span className="text-lg font-black text-emerald-600 tracking-tighter">{formatPrice(product.price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
