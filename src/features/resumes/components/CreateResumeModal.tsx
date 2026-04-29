import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; targetRole?: string }) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name, targetRole: targetRole || undefined });
    setName('');
    setTargetRole('');
  };

  const inputClasses = "w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10 focus:ring-1 focus:ring-[#FC6100] focus:border-[#FC6100] outline-none transition-all duration-200 text-sm text-white placeholder:text-gray-500";
  const labelClasses = "block text-sm font-medium text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Create New Resume</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className={labelClasses}>
              Resume Name <span className="text-[#FC6100]">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Senior Frontend Engineer"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="targetRole" className={labelClasses}>
              Target Role <span className="text-gray-600 font-normal">(Optional)</span>
            </label>
            <input
              id="targetRole"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., React Developer"
              className={inputClasses}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-bold text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-bold text-white bg-[#FC6100] border border-transparent rounded-lg hover:bg-[#E35205] transition-all disabled:opacity-50 flex items-center shadow-lg shadow-[#FC6100]/10"
            >
              {isSubmitting ? 'Creating...' : 'Create Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
