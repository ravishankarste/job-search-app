import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, CheckCircle2, Ghost } from 'lucide-react';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({ isOpen, onClose, companyName }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const templates = [
    {
      title: "The '1-Week Check-in' (After Applying)",
      body: `Hi [Name],\n\nI recently applied for the [Role] position at ${companyName} and wanted to express my continued interest in joining the team.\n\nI've attached my resume for your convenience. Please let me know if there's any additional information I can provide.\n\nBest regards,\n[Your Name]`
    },
    {
      title: "The 'Post-Interview Nudge' (After 2+ Weeks)",
      body: `Hi [Name],\n\nI hope you're having a great week.\n\nI'm following up on my interview for the [Role] position. I remain very interested in the opportunity at ${companyName} and would love to know if you have any updates regarding the next steps.\n\nThank you again for your time!\n\nBest regards,\n[Your Name]`
    },
    {
      title: "The 'Value Add' Follow-up",
      body: `Hi [Name],\n\nFollowing up on my application for the [Role] position. I noticed ${companyName} recently [mention a company news/milestone], which makes me even more excited about the possibility of joining the team to help with [specific skill].\n\nLooking forward to hearing from you.\n\nBest,\n[Your Name]`
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#121212] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <Ghost className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Anti-Ghosting Templates</h2>
              <p className="text-sm text-gray-400">It's been over 14 days. Time to follow up with {companyName}.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {templates.map((template, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative group">
              <h3 className="text-sm font-bold text-[#FC6100] mb-3">{template.title}</h3>
              <div className="bg-black/50 rounded-xl p-4 text-gray-300 text-sm whitespace-pre-wrap font-mono">
                {template.body}
              </div>
              <button
                onClick={() => handleCopy(template.body, index)}
                className="absolute top-5 right-5 p-2 bg-[#121212] border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-[#FC6100] transition-all group-hover:opacity-100 opacity-0 focus:opacity-100"
                title="Copy to clipboard"
              >
                {copiedIndex === index ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
