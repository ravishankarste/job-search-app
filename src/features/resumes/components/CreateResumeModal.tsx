import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, FileText } from 'lucide-react';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; file: File; targetRole?: string }) => Promise<void>;
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
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        if (!name) setName(droppedFile.name.replace('.pdf', ''));
      } else {
        setError('Please upload a PDF file.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) return;
    
    try {
      await onSubmit({ name, file, targetRole: targetRole || undefined });
      
      // Instant Victory Celebration
      import('../../../lib/confetti').then(({ triggerConfetti }) => triggerConfetti());
      
      // Scribe the Success Signal for the Dashboard (Safety Valve)
      sessionStorage.setItem('celebrate_resume', 'true');
      
      setName('');
      setTargetRole('');
      setFile(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create resume.');
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-1 focus:ring-[#FC6100] focus:border-[#FC6100] outline-none transition-all duration-200 text-sm text-white placeholder:text-gray-600";
  const labelClasses = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] rounded-t-[32px]">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Add New Resume</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Instant Creation Flow</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-3">
            <label className={labelClasses}>Resume File (PDF)</label>
            <div
              className={`relative group/upload h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden ${
                file 
                  ? 'border-[#FC6100] bg-[#FC6100]/5' 
                  : 'border-white/5 hover:border-[#FC6100]/30 bg-black/40 hover:bg-[#FC6100]/5'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                  <div className="p-3 bg-[#FC6100]/20 rounded-xl border border-[#FC6100]/30">
                    <FileText className="w-6 h-6 text-[#FC6100]" />
                  </div>
                  <p className="text-xs font-bold text-white truncate max-w-[250px]">{file.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#FC6100]">Document Ready</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-white/5 rounded-xl group-hover/upload:bg-[#FC6100]/10 transition-colors">
                    <UploadCloud className="w-6 h-6 text-gray-500 group-hover/upload:text-[#FC6100] transition-colors" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs font-bold text-white">Drag or Click to Upload</p>
                    <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest mt-1">PDF Version 1.0</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex-1">
              <label htmlFor="name" className={labelClasses}>
                Resume Name
              </label>
              <input
                id="name"
                type="text"
                required
                data-testid="resume-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Primary Resume"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="targetRole" className={labelClasses}>
                Target Role
              </label>
              <input
                id="targetRole"
                type="text"
                data-testid="resume-target-role-input"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Engineer"
                className={inputClasses}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl animate-in shake duration-500">
              {error}
            </div>
          )}

          <div className="pt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !file || isSubmitting}
              data-testid="resume-submit-btn"
              className="flex-[2] px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white bg-[#FC6100] border border-transparent rounded-xl hover:bg-[#E35205] transition-all disabled:opacity-50 flex items-center justify-center shadow-2xl shadow-[#FC6100]/20 active:scale-95"
            >
              {isSubmitting ? 'Saving...' : 'Save Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
