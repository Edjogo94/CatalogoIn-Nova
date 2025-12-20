
import React from 'react';
import { Product } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur rounded-full p-2.5 hover:bg-slate-100 transition-all shadow-sm border border-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="md:w-1/2 h-72 md:h-auto bg-slate-50 relative group">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {product.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-900 shadow-xl">Vista previa disponible</span>
            </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-10 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${CATEGORY_COLORS[product.category] || 'bg-slate-100 text-slate-500'}`}>
              {product.category}
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-3 leading-tight uppercase tracking-tight">{product.name}</h2>
            
            <div className="mt-4 space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precio Detal:</span>
                <span className="text-xl font-bold text-slate-500 line-through decoration-slate-300">{formatPrice(product.retailPrice)}</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Precio Mayorista:</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatPrice(product.price)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sobre este producto</h4>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">{product.description}</p>
          </div>

          <div className="mb-8">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Puntos clave</h4>
            <ul className="grid grid-cols-1 gap-2">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="bg-cyan-600 rounded-full p-1 mr-3 shrink-0">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <a 
              href={`https://wa.me/?text=Hola, me interesa el producto: ${encodeURIComponent(product.name)} - Precio Mayorista: ${formatPrice(product.price)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-center shadow-xl hover:bg-cyan-600 transition-all active:scale-95 uppercase tracking-wide flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.52.909 3.033 1.389 4.625 1.39h.005c5.454 0 9.893-4.439 9.896-9.895.001-2.646-1.03-5.131-2.903-7.005-1.872-1.873-4.359-2.904-7.006-2.905-5.454 0-9.894 4.439-9.897 9.896-.001 1.83.515 3.568 1.492 5.044l-.991 3.62 3.71-.973c1.4.766 2.822 1.137 4.069 1.137zm11.332-6.57c-.066-.109-.242-.175-.506-.307-.264-.132-1.562-.771-1.804-.858-.242-.088-.418-.132-.594.132-.176.264-.682.858-.836 1.034-.154.176-.308.198-.572.066-.264-.132-1.117-.412-2.126-1.314-.786-.701-1.317-1.566-1.471-1.83-.154-.264-.016-.407.116-.539.118-.118.264-.308.396-.462.132-.154.176-.264.264-.44.088-.176.044-.33-.022-.462-.066-.132-.594-1.43-.814-1.958-.214-.515-.429-.444-.594-.452-.154-.008-.33-.01-.506-.01-.176 0-.462.066-.704.33-.242.264-.924.902-.924 2.199 0 1.297.946 2.552 1.078 2.728.132.176 1.861 2.842 4.508 3.982.63.27 1.121.43 1.505.553.633.201 1.208.173 1.662.105.507-.076 1.562-.638 1.782-1.254.22-.616.22-1.144.154-1.254z"/></svg>
              Comprar por WhatsApp
            </a>
            {product.videoUrl && (
              <a 
                href={product.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold text-center hover:bg-slate-200 transition-all active:scale-95 text-xs flex items-center justify-center border border-slate-200"
              >
                <svg className="w-4 h-4 mr-2 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                VER VIDEO DEMOSTRATIVO
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
