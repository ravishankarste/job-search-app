import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeftRight } from 'lucide-react';
import type { ResumeVersion } from '../services/resumeService';
import { resumeService } from '../services/resumeService';

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
  const [urlA, setUrlA] = useState<string>('');
  const [urlB, setUrlB] = useState<string>('');
  const [isLoadingUrls, setIsLoadingUrls] = useState<boolean>(false);
  const [copyStatusA, setCopyStatusA] = useState<string>('Copy');
  const [copyStatusB, setCopyStatusB] = useState<string>('Copy');

  useEffect(() => {
    if (!isOpen) {
      setUrlA('');
      setUrlB('');
      return;
    }

    const loadUrls = async () => {
      setIsLoadingUrls(true);
      try {
        if (versionA?.file_url) {
          let path = versionA.file_url;
          if (path.includes('http')) {
            try {
              const urlObj = new URL(path);
              const pathParts = urlObj.pathname.split('/storage/v1/object/public/resumes/');
              if (pathParts.length > 1) path = pathParts[1];
            } catch (e) {
              console.error("Failed to parse URL A:", e);
            }
          }
          const signedUrl = await resumeService.createSignedUrl(path);
          setUrlA(signedUrl);
        }
        if (versionB?.file_url) {
          let path = versionB.file_url;
          if (path.includes('http')) {
            try {
              const urlObj = new URL(path);
              const pathParts = urlObj.pathname.split('/storage/v1/object/public/resumes/');
              if (pathParts.length > 1) path = pathParts[1];
            } catch (e) {
              console.error("Failed to parse URL B:", e);
            }
          }
          const signedUrl = await resumeService.createSignedUrl(path);
          setUrlB(signedUrl);
        }
      } catch (err) {
        console.error("Failed to load signed URLs:", err);
      } finally {
        setIsLoadingUrls(false);
      }
    };

    loadUrls();
  }, [isOpen, versionA, versionB]);

  const handleCopyText = async (text: string, setStatus: (s: string) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied!');
      setTimeout(() => setStatus('Copy'), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
          {/* Version A */}
          <div className="flex-1 flex flex-col gap-4 min-h-[500px] md:min-h-0">
             <div className="flex items-center justify-between px-2">
                <span className="text-sm font-bold text-white">Version {versionA?.version_number}</span>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{new Date(versionA?.created_at || '').toLocaleDateString()}</span>
             </div>
             <div className="flex-1 bg-black rounded-2xl border border-white/10 overflow-hidden relative flex flex-col">
                {isLoadingUrls ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500 animate-pulse">Loading preview...</div>
                ) : versionA?.file_url ? (
                  urlA ? (
                    <iframe src={urlA} className="w-full h-full border-none grayscale-[0.5] hover:grayscale-0 transition-all" title="Version A" />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600 italic">Failed to load PDF</div>
                  )
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-3 bg-white/5 border-b border-white/5 text-xs shrink-0">
                      <span className="text-[#FC6100] font-black uppercase tracking-widest">Plain Text (Tailored AI Resume)</span>
                      <button 
                        onClick={() => handleCopyText((versionA?.content as any)?.extractedText || '', setCopyStatusA)}
                        className="px-3 py-1 bg-[#FC6100]/20 text-[#FC6100] border border-[#FC6100]/30 rounded-lg hover:bg-[#FC6100]/30 transition-all font-bold"
                      >
                        {copyStatusA}
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 text-xs font-mono text-gray-300 whitespace-pre-wrap select-text">
                      {(versionA?.content as any)?.extractedText || "No text content available"}
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* Version B */}
          <div className="flex-1 flex flex-col gap-4 min-h-[500px] md:min-h-0">
             <div className="flex items-center justify-between px-2">
                <span className="text-sm font-bold text-white">Version {versionB?.version_number}</span>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{new Date(versionB?.created_at || '').toLocaleDateString()}</span>
             </div>
             <div className="flex-1 bg-black rounded-2xl border border-white/10 overflow-hidden relative flex flex-col">
                {isLoadingUrls ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500 animate-pulse">Loading preview...</div>
                ) : versionB?.file_url ? (
                  urlB ? (
                    <iframe src={urlB} className="w-full h-full border-none grayscale-[0.5] hover:grayscale-0 transition-all" title="Version B" />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600 italic">Failed to load PDF</div>
                  )
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-3 bg-white/5 border-b border-white/5 text-xs shrink-0">
                      <span className="text-[#FC6100] font-black uppercase tracking-widest">Plain Text (Tailored AI Resume)</span>
                      <button 
                        onClick={() => handleCopyText((versionB?.content as any)?.extractedText || '', setCopyStatusB)}
                        className="px-3 py-1 bg-[#FC6100]/20 text-[#FC6100] border border-[#FC6100]/30 rounded-lg hover:bg-[#FC6100]/30 transition-all font-bold"
                      >
                        {copyStatusB}
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 text-xs font-mono text-gray-300 whitespace-pre-wrap select-text">
                      {(versionB?.content as any)?.extractedText || "No text content available"}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
