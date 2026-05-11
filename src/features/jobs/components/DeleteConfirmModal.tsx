import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-[40px] shadow-[0_0_50px_rgba(239,68,68,0.1)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center space-y-8">
          <div className="relative group mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full group-hover:bg-red-500/30 transition-all animate-pulse"></div>
            <div className="relative w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[24px] flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Confirm Delete</h2>
            <p className="text-gray-400 font-medium leading-relaxed">
              Are you sure you want to remove <span className="text-white font-bold">"{title}"</span> from your pipeline? This action cannot be undone.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              data-testid="confirm-delete-btn"
              className="w-full px-8 py-5 bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center disabled:opacity-50 shadow-xl shadow-red-500/20"
            >
              {isDeleting ? 'Removing...' : 'Delete Permanently'}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              data-testid="cancel-delete-btn"
              className="w-full px-8 py-5 bg-white/5 text-gray-500 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
