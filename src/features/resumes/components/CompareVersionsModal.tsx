import React from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeftRight } from 'lucide-react';
import type { ResumeVersion } from '../services/resumeService';

interface CompareVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionA: ResumeVersion | null;
  versionB: ResumeVersion | null;
}

export const CompareVersionsModal: React.FC<CompareVersionsModalProps> = ({
  isOpen,
  onClose,
  versionA,
  versionB,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[#121212] w-full max-w-7xl h-[90vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FC6100]/10 rounded-xl flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-[#FC6100]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Compare Versions</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                v{versionA?.version_number} vs v{versionB?.version_number}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-4 md:p-6 gap-6">
          <div className="flex-1 flex flex-col gap-4 min-h-[500px] md:min-h-0">
             <div className="flex items-center justify-between px-2">
                <span className="text-sm font-bold text-white">Version {versionA?.version_number}</span>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{new Date(versionA?.created_at || '').toLocaleDateString()}</span>
             </div>
             <div className="flex-1 bg-black rounded-2xl border border-white/10 overflow-hidden relative">
                {versionA?.file_url ? (
                  <iframe src={versionA.file_url} className="w-full h-full border-none grayscale-[0.5] hover:grayscale-0 transition-all" title="Version A" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 italic">PDF not available</div>
                )}
             </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 min-h-[500px] md:min-h-0">
             <div className="flex items-center justify-between px-2">
                <span className="text-sm font-bold text-white">Version {versionB?.version_number}</span>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{new Date(versionB?.created_at || '').toLocaleDateString()}</span>
             </div>
             <div className="flex-1 bg-black rounded-2xl border border-white/10 overflow-hidden relative">
                {versionB?.file_url ? (
                  <iframe src={versionB.file_url} className="w-full h-full border-none grayscale-[0.5] hover:grayscale-0 transition-all" title="Version B" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 italic">PDF not available</div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
