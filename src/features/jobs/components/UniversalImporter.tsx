import React, { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { apifyService } from '../../discovery/services/apifyService';
import { useJobActions } from '../hooks/useJobActions';
import { trackEvent } from '../../lib/analytics';

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
    if (url.includes('linkedin.com/jobs/search') || url.includes('linkedin.com/jobs/collections')) {
      setError("This looks like a list or search page. To import a specific job, click on the job title first, then click 'Share' ➔ 'Copy link' to get the direct job URL.");
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
        // Silent failure for peek - the scrape or modal will handle it
      }
    }
    
    // 4. Sprint Scrape: Try to get full details but don't wait more than 15s
    const scrapePromise = apifyService.scrapeJobUrl(url);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 25000)
    );

    try {
      // Wait for either the scrape to finish or 15 seconds to pass
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
      
      // Clear input and show success
      setUrl('');
      setIsScraping(false);
      
    } catch (err: any) {
      // 6. Fallback: Open modal with whatever we parsed (Instant + Peek)
      console.log("[UniversalImporter] Scrape slow/failed, opening modal with parsedData:", parsedData);
      
      // If we have at least a title, it's worth pre-filling
      onImportSuccess({
        title: parsedData.title || "",
        company_name: parsedData.company || "" ,
        url: url,
        location: "Remote",
      });
      trackEvent('job_import_success', { method: 'fallback_manual', url });
      setIsScraping(false);
      setUrl('');
    }
  };

  return (
    <div className="clean-card border-[#FC6100]/20 bg-[#FC6100]/5 p-6 mb-12 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC6100]/10 blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        <div className="shrink-0">
          <div className="w-12 h-12 bg-[#FC6100] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FC6100]/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Universal Job Importer</h3>
          <p className="text-xs text-gray-500 font-medium">Found a job on LinkedIn or Indeed? Paste the URL below to auto-import it.</p>
        </div>

        <form onSubmit={handleImport} className="w-full md:w-[500px] flex gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="https://www.linkedin.com/jobs/view/..."
              className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:border-[#FC6100] outline-none transition-all font-bold"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isScraping}
            />
          </div>
          <button 
            type="submit"
            disabled={isScraping || !url.trim()}
            className="px-6 py-3 bg-[#FC6100] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#E35205] transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-[#FC6100]/10"
          >
            {isScraping ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-white bg-red-500/20 p-4 rounded-xl border border-red-500/30 animate-fade-in shadow-lg shadow-red-500/5">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
        </div>
      )}
    </div>
  );
};
