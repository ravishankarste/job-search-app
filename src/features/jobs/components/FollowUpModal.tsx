import React from 'react';
import { Mail, Copy, X, CheckCircle2 } from 'lucide-react';
import { followupService } from '../services/followupService';

interface FollowUpModalProps {
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  jobTitle,
  companyName,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);
  const template = followupService.generateFollowUp(jobTitle, companyName);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-[#121212] border border-white/10 w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-6 h-[2px] bg-red-500"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Recovery Mode</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tighter">Application Follow-up</h2>
              <p className="text-gray-400 font-medium">Drafted specifically for {companyName}</p>
            </div>
            <button 
              onClick={onClose} 
              data-testid="followup-close-btn"
              className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
              <div className="pb-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Subject
                </span>
                <span className="text-sm font-bold text-white">{template.subject}</span>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-medium italic">
                  {template.body}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleCopy}
              data-testid="followup-copy-btn"
              className="flex-1 px-8 py-4 bg-white text-black text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center"
            >
              {copied ? <><CheckCircle2 className="w-5 h-5 mr-2" /> Copied!</> : <><Copy className="w-5 h-5 mr-2" /> Copy to Clipboard</>}
            </button>
            <button
              onClick={() => window.open(`mailto:?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`)}
              data-testid="followup-send-btn"
              className="flex-1 px-8 py-4 bg-[#FC6100] text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-[#E35205] transition-all flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" /> Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
