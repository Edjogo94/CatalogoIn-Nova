
import React, { useState } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  isAdmin: boolean;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onLogin, onLogout, isAdmin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 p-8 border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
          <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-200">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Acceso Administrativo</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Ingresa el código maestro</p>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
              <p className="text-emerald-700 text-xs font-black uppercase tracking-widest">Sesión Iniciada</p>
            </div>
            <button 
              onClick={() => { onLogout(); onClose(); }}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="0000" 
                autoFocus
                maxLength={4}
                className={`w-full bg-slate-50 border ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-100 focus:ring-2 focus:ring-cyan-500/20'} rounded-2xl py-4 px-6 text-center text-xl font-black tracking-[0.5em] outline-none transition-all`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center mt-2">Código Incorrecto</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-cyan-600 transition-all"
            >
              Confirmar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
