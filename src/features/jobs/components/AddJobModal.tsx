import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Sparkles } from 'lucide-react';
import { trackEvent } from '../../../lib/analytics';
import { apifyService } from '../../discovery/services/apifyService';

const parseRawJobText = (text: string) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  let title = '';
  let company_name = '';
  let location = '';

  // Filter out typical browser headers / login / top-nav garbage
  let startIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i].toLowerCase();
    if (
      line.includes('skip to') || 
      line.includes('linkedin') || 
      line.includes('indeed') ||
      line.includes('sign in') || 
      line.includes('join now') ||
      line.includes('hiring now') ||
      line.includes('jobs')
    ) {
      continue;
    }
    startIndex = i;
    break;
  }

  // First non-garbage line: Job Title
  title = lines[startIndex] || '';

  // Guard: If the 'title' is a long paragraph, the user pasted the description body, not the full page.
  // It's too risky to guess the title/company from a raw paragraph using basic string splitting.
  if (title.length > 100) {
    return null;
  }

  // Clean title: remove pipeline chars or trailing separators
  if (title.includes(' | ')) {
    title = title.split(' | ')[0];
  } else if (title.includes(' - ')) {
    title = title.split(' - ')[0];
  }

  // Second line: Company + Optional Location
  if (lines[startIndex + 1]) {
    const nextLine = lines[startIndex + 1];
    
    // Guard: Prevent extracting a paragraph as the company name
    if (nextLine.length > 80) {
      return { title, company_name: '', location: '' };
    }
    
    // Check for "AVEVA · Bengaluru, Karnataka"
    if (nextLine.includes(' · ')) {
      const parts = nextLine.split(' · ');
      company_name = parts[0].trim();
      location = parts[1]?.trim() || '';
    } else if (nextLine.includes(' at ')) {
      const parts = nextLine.split(' at ');
      company_name = parts[0].trim();
      location = parts[1]?.trim() || '';
    } else if (nextLine.includes(' - ')) {
      const parts = nextLine.split(' - ');
      company_name = parts[0].trim();
      location = parts[1]?.trim() || '';
    } else {
      company_name = nextLine.trim();
      if (lines[startIndex + 2]) {
        // If third line looks like a location (contains letters but not full paragraphs)
        const thirdLine = lines[startIndex + 2].trim();
        if (thirdLine.length < 50 && !thirdLine.includes(' ')) {
          location = thirdLine;
        } else if (thirdLine.length < 50 && (thirdLine.includes(',') || thirdLine.toLowerCase().includes('remote') || thirdLine.toLowerCase().includes('hybrid'))) {
          location = thirdLine;
        }
      }
    }
  }

  // Filter applicant count or date stamps from company/location strings
  if (company_name) {
    company_name = company_name.split('   ')[0].split('\t')[0].split('(')[0].trim();
  }
  if (location) {
    location = location.split('   ')[0].split('\t')[0].split('(')[0].trim();
    // Capitalize location properly
    location = location.split(', ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(', ');
  }

  return { title, company_name, location };
};

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<{
    company_name: string;
    title: string;
    url: string;
    description: string;
    location: string;
    employment_type: string;
  }>;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    company_name: '',
    title: '',
    url: '',
    description: '',
    location: '',
    employment_type: 'full-time',
  });

  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [isScrapingFromUrl, setIsScrapingFromUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const runAutofill = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setIsScrapingFromUrl(true);
    setUrlError(null);
    try {
      const parsedData = apifyService.parseJobDetailsFromUrl(targetUrl);
      const ogData = await apifyService.peekOgMetadata(targetUrl);
      
      const finalTitle = ogData.title || parsedData.title || "";
      const finalCompany = ogData.company || parsedData.company || "";
      const finalDescription = ogData.description || "";
      const finalLocation = ogData.location || "Remote";

      setFormData(prev => ({
        ...prev,
        title: finalTitle,
        company_name: finalCompany,
        description: finalDescription || prev.description,
        location: finalLocation !== 'Remote' ? finalLocation : prev.location || 'Remote'
      }));
      setHasAutofilled(true);
    } catch (err: any) {
      console.error("[AddJobModal] Autofill failed:", err);
      const parsedData = apifyService.parseJobDetailsFromUrl(targetUrl);
      if (parsedData.title || parsedData.company) {
        setFormData(prev => ({
          ...prev,
          title: parsedData.title || prev.title,
          company_name: parsedData.company || prev.company_name,
        }));
        setHasAutofilled(true);
      } else {
        setUrlError("We couldn't scrape this page. Try copying the page text (Command+A, Command+C) and pasting it in the Description field below!");
      }
    } finally {
      setIsScrapingFromUrl(false);
    }
  };

  const handleAutofillFromUrl = () => {
    runAutofill(formData.url);
  };

  // Reset form with initialData when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const initialUrl = initialData?.url || '';
      const initialTitle = initialData?.title || '';
      const initialCompany = initialData?.company_name || '';
      const initialDesc = initialData?.description || '';
      const initialLoc = initialData?.location || '';

      setFormData({
        company_name: initialCompany,
        title: initialTitle,
        url: initialUrl,
        description: initialDesc,
        location: initialLoc || '',
        employment_type: initialData?.employment_type || 'full-time',
      });
      setHasAutofilled(false);
      setUrlError(null);

      // Automatic Ingestion: If opened with a URL but no title/company, run autofill instantly!
      if (initialUrl.trim() && (!initialTitle.trim() || !initialCompany.trim())) {
        runAutofill(initialUrl);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('job_saved', { method: 'manual', url: formData.url });
    onSubmit(formData);
  };

  const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-1 focus:ring-[#FC6100] focus:border-[#FC6100] outline-none transition-all duration-200 text-sm text-white placeholder:text-gray-600";
  const labelClasses = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#121212] border border-white/10 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden fade-in-up">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Add New Opportunity</h2>
            <p className="text-gray-500 text-sm mt-1">Found a great role? Let's track it in your pipeline.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>



        {hasAutofilled && (
          <div className="mx-8 mt-2 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                ⚡ Smart Extraction: Auto-filled Company, Role Title, and Location!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Company Name */}
            <div>
              <label className={labelClasses}>Company <span className="text-[#FC6100]">*</span></label>
              <input
                required
                type="text"
                data-testid="job-company-input"
                placeholder="e.g. Google, Stripe"
                className={inputClasses}
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            {/* Job Title */}
            <div>
              <label className={labelClasses}>Role Title <span className="text-[#FC6100]">*</span></label>
              <input
                required
                type="text"
                data-testid="job-title-input"
                placeholder="e.g. Senior Frontend Engineer"
                className={inputClasses}
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          {/* Job URL */}
          <div>
            <label className={labelClasses}>Job Posting URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                data-testid="job-url-input"
                placeholder="https://www.linkedin.com/jobs/view/..."
                className={`${inputClasses} flex-1`}
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
              />
              <button
                type="button"
                onClick={handleAutofillFromUrl}
                disabled={isScrapingFromUrl || !formData.url.trim()}
                className="px-4 py-3 bg-[#FC6100]/20 hover:bg-[#FC6100]/30 border border-[#FC6100]/30 hover:border-[#FC6100]/50 text-[#FC6100] text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 disabled:opacity-30 disabled:hover:bg-[#FC6100]/20 flex items-center gap-1.5 shrink-0"
              >
                {isScrapingFromUrl ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#FC6100]/30 border-t-[#FC6100] rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isScrapingFromUrl ? 'Scanning...' : 'Autofill'}
              </button>
            </div>
            {urlError && (
              <p className="text-[10px] text-red-500 font-medium mt-1.5 ml-1 leading-relaxed">
                ⚠️ {urlError}
              </p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className={labelClasses}>Job Description (For ATS Match Scoring)</label>
            <textarea
              placeholder="Paste the full job description or raw job page text here..."
              data-testid="job-description-textarea"
              className={`${inputClasses} h-24 resize-y`}
              value={formData.description}
              onChange={e => {
                const val = e.target.value;
                setFormData(prev => {
                  const nextData = { ...prev, description: val };
                  if (!prev.title.trim() && !prev.company_name.trim() && val.trim().length > 15) {
                    const parsed = parseRawJobText(val);
                    if (parsed && parsed.title && parsed.company_name) {
                      nextData.title = parsed.title;
                      nextData.company_name = parsed.company_name;
                      if (parsed.location) nextData.location = parsed.location;
                      setHasAutofilled(true);
                      trackEvent('job_smart_parsed_successfully', { company: parsed.company_name });
                    }
                  }
                  return nextData;
                });
              }}
            />
            <p className="text-[9px] text-gray-500 font-medium mt-1.5 ml-1 leading-relaxed">
              💡 **Resilient Fallback:** If scraping is blocked, copy the entire job page (Command+A, Command+C) and paste it here. We'll instantly extract the Title and Company!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Location */}
            <div>
              <label className={labelClasses}>Location</label>
              <input
                type="text"
                placeholder="e.g. Remote, New York, NY"
                className={inputClasses}
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className={labelClasses}>Type</label>
              <select
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-1 focus:ring-[#FC6100] focus:border-[#FC6100] outline-none transition-all duration-200 text-sm text-white appearance-none cursor-pointer"
                value={formData.employment_type}
                onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
              >
                <option value="full-time" className="bg-[#121212]">Full-time</option>
                <option value="part-time" className="bg-[#121212]">Part-time</option>
                <option value="contract" className="bg-[#121212]">Contract</option>
                <option value="internship" className="bg-[#121212]">Internship</option>
                <option value="freelance" className="bg-[#121212]">Freelance</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="job-discard-btn"
              className="flex-1 px-6 py-4 text-sm font-bold text-gray-400 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-200 active:scale-95"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="job-save-btn"
              className="flex-[2] inline-flex items-center justify-center px-6 py-4 text-sm font-bold rounded-2xl shadow-xl shadow-[#FC6100]/10 text-white bg-[#FC6100] hover:bg-[#E35205] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Save to Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
