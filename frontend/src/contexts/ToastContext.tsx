import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastMessage } from '../components/ToastContainer';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, messageEn?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  showSuccess: (message: string, messageEn?: string) => void;
  showError: (message: string, messageEn?: string) => void;
  showWarning: (message: string, messageEn?: string) => void;
  showInfo: (message: string, messageEn?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, messageEn?: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastMessage = { id, message, messageEn, type };
    setToasts(prev => [...prev.slice(-4), newToast]); // Limit to 5 max active toasts
  }, []);

  const showSuccess = useCallback((message: string, messageEn?: string) => {
    showToast(message, messageEn, 'success');
  }, [showToast]);

  const showError = useCallback((message: string, messageEn?: string) => {
    showToast(message, messageEn, 'error');
  }, [showToast]);

  const showWarning = useCallback((message: string, messageEn?: string) => {
    showToast(message, messageEn, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message: string, messageEn?: string) => {
    showToast(message, messageEn, 'info');
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
