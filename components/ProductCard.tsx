
import React from 'react';
import { Product } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `¡Hola! Me interesa la *${product.name}* del catálogo. ¿Tienen disponibilidad?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div 
      onClick={() => onClick(product)}
      className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 border border-slate-100 cursor-pointer flex flex-col h-full relative"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-5 left-5">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm backdrop-blur-md ${CATEGORY_COLORS[product.category] || 'bg-white/90 text-slate-600'}`}>
            {product.category}
          </span>
        </div>

        <button 
          onClick={handleWhatsApp}
          className="absolute bottom-5 right-5 bg-white text-slate-900 p-3.5 rounded-2xl shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-cyan-500 hover:text-white"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.069l-.669 2.455 2.511-.659c.748.408 1.742.714 2.888.715 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zM15.512 14.659c-.133.373-.775.688-1.071.733-.296.044-.593.067-.889.022-.296-.045-1.554-.492-2.92-1.712-1.066-.95-1.785-2.122-1.992-2.478-.207-.356-.022-.549.155-.726.159-.159.356-.415.534-.623.178-.208.237-.356.356-.593.118-.237.059-.445-.03-.623-.089-.178-.775-1.875-1.062-2.56-.279-.667-.565-.575-.775-.586h-.662c-.237 0-.623.089-.95.445-.326.356-1.246 1.217-1.246 2.967 0 1.751 1.275 3.441 1.453 3.678.178.237 2.508 3.832 6.075 5.373.849.367 1.512.587 2.029.75.852.271 1.628.233 2.241.142.684-.102 2.099-.858 2.396-1.688.297-.83.297-1.542.208-1.689-.089-.147-.326-.236-.653-.394z"/></svg>
        </button>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-black text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-cyan-600 transition-colors uppercase tracking-tight">
          {product.name}
        </h3>
        <p className="text-slate-400 text-[11px] mb-6 line-clamp-2 flex-grow font-medium leading-relaxed italic">
          {product.description}
        </p>
        
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Detal</span>
              <span className="text-[10px] font-bold text-slate-400 line-through">{formatPrice(product.retailPrice)}</span>
            </div>
            <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest leading-none mb-1">X Mayor</span>
            <span className="text-2xl font-black text-slate-900 leading-none tracking-tighter">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <div className="bg-slate-50 group-hover:bg-slate-900 p-3 rounded-2xl transition-all duration-500">
            <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
