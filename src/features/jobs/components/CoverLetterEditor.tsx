import React, { useState } from 'react';
import { Sparkles, FileText, Save, CheckCircle2 } from 'lucide-react';
import { coverLetterGeneratorService } from '../services/coverLetterGeneratorService';
import type { MatchScoreResult } from '../services/matchAnalysisService';
import { useCoverLetter } from '../hooks/useCoverLetter';

interface CoverLetterEditorProps {
  applicationId: string;
  job: { title: string; company_name: string };
  matchResult: MatchScoreResult;
  targetRole?: string;
}

export const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({ 
  applicationId, 
  job, 
  matchResult,
  targetRole 
}) => {
  const { coverLetter, isLoading, saveCoverLetter, isSaving } = useCoverLetter(applicationId);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMagicDraft = () => {
    const draft = coverLetterGeneratorService.generateDraft({
      jobTitle: job.title,
      companyName: job.company_name,
      matchingSkills: matchResult.matchingSkills,
      targetRole: targetRole || ""
    });
    setContent(draft);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await saveCoverLetter(content);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-white/5 rounded-3xl border border-white/10"></div>;
  }

  return (
    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl text-white uppercase tracking-tighter flex items-center">
          <FileText className="w-5 h-5 mr-2 text-[#FC6100]" /> Cover Letter
        </h3>
        
        {showSuccess && (
          <span className="flex items-center text-emerald-500 text-sm font-bold fade-in">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Saved
          </span>
        )}
      </div>

      {!coverLetter && !isEditing ? (
        <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5 border-dashed space-y-4">
          <p className="text-gray-400 font-medium text-sm">You haven't written a cover letter for this application yet.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-6">
            <button
              onClick={handleMagicDraft}
              data-testid="cover-letter-magic-draft-btn"
              className="px-6 py-2.5 bg-gradient-to-r from-[#FC6100] to-[#E35205] text-white text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(252,97,0,0.3)] transition-all flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Magic Draft (AI)
            </button>
            <button
              onClick={() => {
                setContent('');
                setIsEditing(true);
              }}
              data-testid="cover-letter-manual-draft-btn"
              className="px-6 py-2.5 bg-white/5 text-gray-300 hover:text-white text-sm font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              Manual Draft
            </button>
          </div>
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            data-testid="cover-letter-textarea"
            placeholder="Dear Hiring Manager..."
            className="w-full h-64 px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] resize-none"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setContent(coverLetter?.content || '');
                setIsEditing(false);
              }}
              data-testid="cover-letter-cancel-btn"
              className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              data-testid="cover-letter-save-btn"
              className="px-6 py-2 bg-[#FC6100] text-white text-sm font-bold rounded-xl hover:bg-[#E35205] transition-all disabled:opacity-50 flex items-center"
            >
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Draft</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-5 bg-black/40 border border-white/5 rounded-2xl relative group">
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed line-clamp-6 group-hover:line-clamp-none transition-all">
              {coverLetter?.content}
            </p>
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent group-hover:hidden rounded-b-2xl"></div>
          </div>
          <button
            onClick={() => {
              setContent(coverLetter?.content || '');
              setIsEditing(true);
            }}
            data-testid="cover-letter-edit-btn"
            className="w-full py-3 bg-white/5 text-gray-300 hover:text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all"
          >
            Edit Cover Letter
          </button>
        </div>
      )}
    </div>
  );
};
