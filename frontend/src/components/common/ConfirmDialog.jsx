import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya, Hapus', cancelText = 'Batal', loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title || 'Konfirmasi Tindakan'}</h3>
        <p className="text-sm text-slate-600 mb-6">{message || 'Apakah Anda yakin ingin melanjutkan tindakan ini?'}</p>
        
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
