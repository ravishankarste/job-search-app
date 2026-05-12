import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[32px] shadow-2xl p-8 md:p-10 animate-in zoom-in-95 fade-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Confirm Deletion</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Are you sure you want to delete <span className="text-white font-bold">"{title}"</span>? 
              This action is permanent and cannot be undone.
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full py-4 bg-red-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Confirm Delete
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-4 bg-white/5 text-gray-400 text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
