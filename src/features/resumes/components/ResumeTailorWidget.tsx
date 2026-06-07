import React, { useEffect, useState } from 'react';
import { useTailorResume } from '../hooks/useTailorResume';
import { supabase } from '../../../lib/supabaseClient';
import { Sparkles, FileText, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResumeTailorWidgetProps {
  applicationId: string;
}

export const ResumeTailorWidget: React.FC<ResumeTailorWidgetProps> = ({ applicationId }) => {
  const { tailorResume, isTailoring, error } = useTailorResume();
  const navigate = useNavigate();
  
  const [tailoredResume, setTailoredResume] = useState<any>(null);
  const [baseResumes, setBaseResumes] = useState<any[]>([]);
  const [selectedBaseResume, setSelectedBaseResume] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchResumes = async () => {
    setIsLoading(true);
    // Fetch base resumes (not tailored)
    const { data: baseData } = await supabase
      .from('resumes')
      .select('id, name')
      .eq('is_tailored', false);
      
    if (baseData) {
      setBaseResumes(baseData);
      if (baseData.length > 0) setSelectedBaseResume(baseData[0].id);
    }

    // Fetch existing tailored resume for this application
    const { data: tailoredData } = await supabase
      .from('resumes')
      .select('*')
      .eq('application_id', applicationId)
      .eq('is_tailored', true)
      .single();

    if (tailoredData) {
      setTailoredResume(tailoredData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (applicationId) fetchResumes();
  }, [applicationId]);

  const handleTailor = async () => {
    if (!selectedBaseResume) return;
    try {
      await tailorResume(selectedBaseResume, applicationId);
      await fetchResumes(); // Refresh to show new resume
    } catch (e) {
      // Error handled by hook
    }
  };

  const handlePromote = async () => {
    if (!tailoredResume) return;
    const { error } = await supabase
      .from('resumes')
      .update({ is_tailored: false, application_id: null })
      .eq('id', tailoredResume.id);
      
    if (!error) {
      setTailoredResume(null); // It's promoted out of this widget
      alert('Success! This resume is now in your Master Resume Vault.');
    } else {
      alert('Failed to promote resume.');
    }
  };

  if (isLoading) {
    return <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl animate-pulse h-32"></div>;
  }

  if (tailoredResume) {
    return (
      <div className="p-6 bg-gradient-to-br from-green-500/10 to-[#121212] border border-green-500/20 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-white">ATS Tailored Resume Ready</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-6">
          We used AI to perfectly align your experience with this job description.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate(`/resumes/${tailoredResume.id}`)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-all"
          >
            <FileText className="w-4 h-4" />
            View & Edit Resume
          </button>
          
          <button 
            onClick={handlePromote}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 text-yellow-500 font-bold rounded-xl transition-all"
          >
            <Star className="w-4 h-4" />
            Save as Master Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FC6100]/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#FC6100]/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-[#FC6100]" />
          </div>
          <h3 className="text-lg font-bold text-white">AI Resume Tailor</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-5">
          Select a base resume. Our AI will re-write it to match this job description perfectly and beat the ATS filters.
        </p>

        {baseResumes.length > 0 ? (
          <div className="space-y-4">
            <select 
              value={selectedBaseResume}
              onChange={(e) => setSelectedBaseResume(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FC6100] transition-colors"
            >
              {baseResumes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button 
              onClick={handleTailor}
              disabled={isTailoring || !selectedBaseResume}
              className="w-full py-3 bg-[#FC6100] text-white font-bold rounded-xl hover:bg-[#E35205] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,97,0,0.3)] hover:shadow-[0_0_30px_rgba(252,97,0,0.5)]"
            >
              {isTailoring ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tailoring... (Takes ~10s)
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Tailor Resume for this Job
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-gray-400 text-center">
            You don't have any master resumes yet. Create one in the Resume Vault first!
          </div>
        )}
      </div>
    </div>
  );
};
