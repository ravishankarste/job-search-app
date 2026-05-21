import React, { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { apifyService } from '../../discovery/services/apifyService';
import { useJobActions } from '../hooks/useJobActions';
import { trackEvent } from '../../../lib/analytics';

interface UniversalImporterProps {
  onImportSuccess: (data: any) => void;
}

export const UniversalImporter: React.FC<UniversalImporterProps> = ({ onImportSuccess }) => {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createJob } = useJobActions();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsScraping(true);
    setError(null);
    trackEvent('job_import_started', { url });

    // 1. Validator: Check if it's a collection/search URL instead of a single job
    const isSearchUrl = url.includes('linkedin.com/jobs/search') || url.includes('linkedin.com/jobs/collections');
    const hasJobId = url.includes('currentJobId=') || url.match(/\/view\/\d+/) || url.match(/\/jobs\/\d+/);

    if (isSearchUrl && !hasJobId) {
      setError("To import from a search list, click on a specific job first to ensure the URL contains the Job ID.");
      setIsScraping(false);
      return;
    }

    // 2. Instant Parse: Extract whatever we can from the URL string itself (0ms wait)
    let parsedData = apifyService.parseJobDetailsFromUrl(url);
    
    // 3. Web Peek Fallback: If regex failed, try a quick metadata lookup (3-5s)
    if (!parsedData.title || !parsedData.company) {
      try {
        const peekResult = await apifyService.peekUrlMetadata(url);
        parsedData = { ...parsedData, ...peekResult };
      } catch (e: any) {
        console.warn("[UniversalImporter] Web peek failed", e);
      }
    }
    
    // 4. Sprint Scrape: Try to get full details but don't wait more than 12s (Optimal for Videos)
    const scrapePromise = apifyService.scrapeJobUrl(url);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 12000)
    );

    try {
      // Wait for either the scrape to finish or 12 seconds to pass
      const jobData = await Promise.race([scrapePromise, timeoutPromise]) as any;
      
      // 5. Success: True 1-Click Import!
      await createJob({
        title: jobData.title,
        company_name: jobData.company_name,
        location: jobData.location,
        url: url,
        description: jobData.description,
        employment_type: 'full-time',
      });
      
      trackEvent('job_import_success', { method: 'automated', url });
      
      // Instant Victory Celebration
      import('../../../lib/confetti').then(({ triggerConfetti }) => triggerConfetti());
      
      // Scribe the Success Signal for the Dashboard (Safety Valve)
      sessionStorage.setItem('celebrate_job', 'true');
      
      setUrl('');
      setIsScraping(false);
      
    } catch (err: any) {
      // 6. Intelligence Fallback: Try a high-speed OG Peek before opening the modal
      let fallbackTitle = parsedData.title;
      let fallbackCompany = parsedData.company;
      let fallbackDescription = "";

      if (!fallbackTitle || !fallbackCompany) {
        try {
          const ogData = await apifyService.peekOgMetadata(url);
          fallbackTitle = fallbackTitle || ogData.title;
          fallbackCompany = fallbackCompany || ogData.company;
          fallbackDescription = ogData.description || "";
        } catch (e) {
          console.warn("[UniversalImporter] OG Fallback failed", e);
        }
      }

      // 7. Open modal with whatever we captured (Slug + OG)
      onImportSuccess({
        title: fallbackTitle || "",
        company_name: fallbackCompany || "" ,
        url: url,
        location: "Remote",
        description: fallbackDescription || ""
      });
      trackEvent('job_import_success', { method: 'fallback_manual', url });
      setIsScraping(false);
      setUrl('');
    }
  };

  // Instant Heuristic Preview
  const preview = url ? apifyService.parseJobDetailsFromUrl(url) : null;

  return (
    <div className="clean-card border-[#FC6100]/20 bg-[#FC6100]/5 p-8 mb-12 relative overflow-hidden group">
      {/* Dynamic Background Pulse */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-[#FC6100]/5 blur-3xl -mr-32 -mt-32 transition-opacity duration-1000 ${url ? 'opacity-100' : 'opacity-0'}`}></div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
        <div className="shrink-0">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${
            isScraping 
              ? 'bg-white/10 animate-pulse' 
              : url ? 'bg-[#FC6100] shadow-[#FC6100]/20 rotate-0' : 'bg-white/5 -rotate-12'
          }`}>
            <Sparkles className={`w-7 h-7 transition-colors ${url ? 'text-white' : 'text-gray-600'}`} />
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Compare Job Link</h3>
            {isScraping && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FC6100]/20 rounded-full animate-in fade-in zoom-in duration-300">
                <span className="w-1 h-1 bg-[#FC6100] rounded-full animate-ping"></span>
                <span className="text-[8px] font-black text-[#FC6100] uppercase tracking-widest">Active Scan</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-md">
            Paste any job description URL. Our OS will extract the role, company, and description in seconds.
          </p>
        </div>

        <form onSubmit={handleImport} className="w-full md:w-[500px] space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                type="text" 
                data-testid="universal-import-input"
                placeholder="Paste job description URL here..."
                className="w-full pl-5 pr-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-[13px] text-white placeholder-gray-700 focus:border-[#FC6100] focus:bg-black/60 focus:ring-1 focus:ring-[#FC6100]/20 outline-none transition-all font-bold"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScraping}
              />
              
              {/* Instant Recognition Badge */}
              {preview?.title && !isScraping && (
                <div className="absolute -bottom-10 left-0 flex items-center gap-3 px-1 animate-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                    <span className="text-[9px] font-black text-[#FC6100] uppercase tracking-widest">Detected</span>
                    <span className="text-[10px] font-bold text-white truncate max-w-[300px]">
                      {preview.title} <span className="text-gray-500 font-medium">@</span> {preview.company || "Company"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button 
              type="submit"
              data-testid="universal-import-btn"
              disabled={isScraping || !url.trim()}
              className="px-8 py-4 bg-[#FC6100] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#E35205] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-2xl shadow-[#FC6100]/20 shrink-0"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                'Analyze Link'
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div 
          data-testid="universal-import-error"
          className="mt-12 flex items-center gap-3 text-white bg-red-500/10 p-5 rounded-2xl border border-red-500/20 animate-in shake duration-500 shadow-2xl shadow-red-500/5"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.1em] leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
};
