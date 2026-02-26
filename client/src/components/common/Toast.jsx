import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamation, HiX } from 'react-icons/hi';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ICONS = {
  success: <HiCheckCircle className="w-5 h-5 text-green-400" />,
  error: <HiXCircle className="w-5 h-5 text-red-400" />,
  info: <HiInformationCircle className="w-5 h-5 text-blue-400" />,
  warning: <HiExclamation className="w-5 h-5 text-yellow-400" />,
};

const BORDERS = {
  success: 'border-green-400',
  error: 'border-red-400',
  info: 'border-blue-400',
  warning: 'border-yellow-400',
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 min-w-[280px] max-w-sm">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`flex items-center gap-3 bg-[#1A1A2E] text-white px-4 py-3 rounded-xl shadow-lg border-l-4 ${BORDERS[t.type]} animate-fade-in`}
      >
        {ICONS[t.type]}
        <p className="flex-1 text-sm font-body">{t.message}</p>
        <button onClick={() => onRemove(t.id)} className="text-gray-400 hover:text-white ml-2">
          <HiX className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

export default ToastProvider;
