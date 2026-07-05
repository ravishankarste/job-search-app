import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { jobService } from '../../features/jobs/services/jobService';
import { 
  Layers, 
  ArrowRight, 
  Zap, 
  Target, 
  Cpu, 
  Globe,
  MapPin
} from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { matchAnalysisService, SYNONYMS, KEYWORD_WEIGHTS } from '../../features/jobs/services/matchAnalysisService';
import { pdfExtractionService } from '../../features/resumes/services/pdfExtractionService';
import { jobRelevanceService } from '../../features/discovery/services/jobRelevanceService';
import { apifyService, type DiscoveredJob } from '../../features/discovery/services/apifyService';


export const LandingPage: React.FC = () => {
  const { session, isLoading } = useAuth();
  
  // Widget State
  const [jobText, setJobText] = React.useState('');
  const [resumeText, setResumeText] = React.useState('');
  const [resumeFileName, setResumeFileName] = React.useState<string | null>(null);
  const [isScrapingFullDesc, setIsScrapingFullDesc] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  
  // Value-First Geolocation & Select Job state
  const [searchRole, setSearchRole] = React.useState('');
  const isSearching = searchRole.trim().length >= 2;
  const [detectedLocation, setDetectedLocation] = React.useState('London, UK');
  const [showMatchModal, setShowMatchModal] = React.useState(false);

  // Live Search State
  const [liveJobs, setLiveJobs] = React.useState<DiscoveredJob[]>([]);
  const [isSearchingLive, setIsSearchingLive] = React.useState(false);
  const [lastSearch, setLastSearch] = React.useState('');

  // Postcode/Pincode Override States
  const [isChangingLocation, setIsChangingLocation] = React.useState(false);
  const [postalInput, setPostalInput] = React.useState('');
  const [postalError, setPostalError] = React.useState('');
  const [isLoadingPostal, setIsLoadingPostal] = React.useState(false);

  React.useEffect(() => {
    const handler = setTimeout(async () => {
      const currentSearch = searchRole.trim();
      if (currentSearch.length >= 2) {
        setIsSearchingLive(true);
        
        // Track search initiation or refinement
        if (lastSearch && lastSearch !== currentSearch) {
          trackEvent('search_refined', { from: lastSearch, to: currentSearch, location: detectedLocation });
        } else if (!lastSearch) {
          trackEvent('search_initiated', { query: currentSearch, location: detectedLocation });
        }
        
        try {
          const results = await jobRelevanceService.searchJobs(currentSearch, detectedLocation);
          setLiveJobs(results);
          
          trackEvent('search_completed', { 
            query: currentSearch, 
            location: detectedLocation, 
            result_count: results.length 
          });

          if (results.length === 0) {
            trackEvent('search_zero_results', { query: currentSearch, location: detectedLocation });
          }
          
          setLastSearch(currentSearch);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingLive(false);
        }
      } else {
        setLiveJobs([]);
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [searchRole, detectedLocation]);

  React.useEffect(() => {
    // 1. Silent IP Geolocation Lookup
    fetch('https://ipapi.co/json/')
      .then((res) => {
        if (!res.ok) throw new Error('IP lookup failed');
        return res.json();
      })
      .then((data) => {
        const city = data.city || '';
        const country = data.country_code || '';
        if (city.toLowerCase().includes('london') || country.toLowerCase() === 'gb') {
          setDetectedLocation('London, UK');
        } else if (city.toLowerCase().includes('hyderabad')) {
          setDetectedLocation('Hyderabad, India');
        } else if (city.toLowerCase().includes('bengaluru') || city.toLowerCase().includes('bangalore') || country.toLowerCase() === 'in') {
          if (city.toLowerCase().includes('hyderabad')) {
            setDetectedLocation('Hyderabad, India');
          } else {
            setDetectedLocation('Bengaluru, India');
          }
        } else {
          setDetectedLocation('London, UK');
        }
      })
      .catch(() => {
        // 2. Fallback Timezone/Language Heuristics
        if (
          navigator.language.includes('in') || 
          Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Calcutta') || 
          Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Asia')
        ) {
          setDetectedLocation('Bengaluru, India');
        } else {
          setDetectedLocation('London, UK');
        }
      });
  }, []);

  const handlePostalLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = postalInput.trim().toUpperCase();
    if (!query) return;

    setIsLoadingPostal(true);
    setPostalError('');

    const lowerQuery = query.toLowerCase();

    // 1. Direct City Name Check with spelling-tolerant fuzzy matches
    if (lowerQuery.includes('bang') || lowerQuery.includes('beng') || lowerQuery.includes('blr')) {
      setDetectedLocation('Bengaluru, India');
      setIsChangingLocation(false);
      setPostalInput('');
      setIsLoadingPostal(false);
      return;
    }
    if (lowerQuery.includes('hyd')) {
      setDetectedLocation('Hyderabad, India');
      setIsChangingLocation(false);
      setPostalInput('');
      setIsLoadingPostal(false);
      return;
    }
    if (lowerQuery.includes('lon') || lowerQuery.includes('ldn') || lowerQuery.includes('uk')) {
      setDetectedLocation('London, UK');
      setIsChangingLocation(false);
      setPostalInput('');
      setIsLoadingPostal(false);
      return;
    }

    // 2. Postcode/Pincode API Fallback
    const isNumeric = /^\d+$/.test(query);

    try {
      if (isNumeric) {
        // India Pincode lookup
        if (query.length !== 6) {
          throw new Error('Indian Pincode must be exactly 6 digits.');
        }
        const res = await fetch(`https://api.postalpincode.in/pincode/${query}`);
        const data = await res.json();
        
        if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffices = data[0].PostOffice;
          let isHyderabad = false;
          let isBengaluru = false;
          
          for (const po of postOffices) {
            const district = (po.District || '').toLowerCase();
            const state = (po.State || '').toLowerCase();
            const poName = (po.Name || '').toLowerCase();
            
            if (
              district.includes('hyderabad') || 
              state.includes('hyderabad') || 
              poName.includes('hyderabad')
            ) {
              isHyderabad = true;
              break;
            }
            if (
              district.includes('bangalore') || 
              district.includes('bengaluru') || 
              state.includes('karnataka') ||
              poName.includes('bangalore') ||
              poName.includes('bengaluru')
            ) {
              isBengaluru = true;
              break;
            }
          }
          
          if (isHyderabad) {
            setDetectedLocation('Hyderabad, India');
            setIsChangingLocation(false);
            setPostalInput('');
          } else if (isBengaluru) {
            setDetectedLocation('Bengaluru, India');
            setIsChangingLocation(false);
            setPostalInput('');
          } else {
            // Use the actual district and state from the first post office match
            const defaultPo = postOffices[0];
            const dynamicLocation = `${defaultPo.District || defaultPo.Name}, India`;
            setDetectedLocation(dynamicLocation);
            setIsChangingLocation(false);
            setPostalInput('');
          }
        } else {
          throw new Error('Invalid pincode. No region found.');
        }
      } else {
        // Heuristic: Check if it resembles a UK postcode (length 3 to 8 characters)
        const cleanQuery = query.replace(/\s+/g, '');
        const isUKPostcodeHeuristic = cleanQuery.length >= 3 && cleanQuery.length <= 8 && /[A-Z]/.test(cleanQuery) && /[0-9]/.test(cleanQuery);
        
        if (!isUKPostcodeHeuristic) {
          throw new Error("Please enter a valid UK postcode, Indian pincode, or city name (e.g. 'Bengaluru', 'London').");
        }

        // UK Postcode lookup using api.postcodes.io
        const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (res.ok && data.status === 200 && data.result) {
          setDetectedLocation('London, UK');
          setIsChangingLocation(false);
          setPostalInput('');
        } else {
          const outcodeRes = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(query)}`);
          const outcodeData = await outcodeRes.json();
          if (outcodeRes.ok && outcodeData.status === 200 && outcodeData.result) {
            setDetectedLocation('London, UK');
            setIsChangingLocation(false);
            setPostalInput('');
          } else {
            throw new Error('Invalid UK postcode. Please check your spelling.');
          }
        }
      }
    } catch (err: any) {
      setPostalError(err.message || 'Location resolution failed. Try again.');
    } finally {
      setIsLoadingPostal(false);
    }
  };



  const navigate = useNavigate();
  const [selectedJobContext, setSelectedJobContext] = React.useState<DiscoveredJob | null>(null);
  const [isJobSaved, setIsJobSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSelectJob = async (job: DiscoveredJob | { title: string, company_name: string, description: string, location: string, url: string }) => {
    const cleanDesc = (job.description || '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    setJobText(cleanDesc);
    setSelectedJobContext(job as DiscoveredJob);
    setIsJobSaved(false);
    setShowMatchModal(true);
    trackEvent('job_opened', { title: job.title, company: job.company_name });

    // If description is a truncated snippet with ellipsis or very short, crawl the full JD
    if (job.url && (cleanDesc.includes('...') || cleanDesc.length < 500)) {
      setIsScrapingFullDesc(true);
      try {
        const fullJob = await apifyService.scrapeJobUrl(job.url);
        if (fullJob && fullJob.description) {
          const cleanFullDesc = fullJob.description
            .replace(/<[^>]*>?/gm, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          setJobText(cleanFullDesc);
          setSelectedJobContext(prev => prev ? { ...prev, description: cleanFullDesc } : null);
        }
      } catch (err) {
        console.warn("[LandingPage] Background scrape of full description failed:", err);
      } finally {
        setIsScrapingFullDesc(false);
      }
    }
  };

  const handleSaveJob = async () => {
    if (!session?.user || !selectedJobContext) return;
    setIsSaving(true);
    try {
      await jobService.createJob({
        title: selectedJobContext.title,
        company_name: selectedJobContext.company_name,
        description: selectedJobContext.description,
        location: selectedJobContext.location,
        url: selectedJobContext.url || '',
        employment_type: 'full-time'
      });
      trackEvent('job_saved', { method: 'landing_page', url: selectedJobContext.url });
      setIsJobSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const [result, setResult] = React.useState<{ score: number, matchingSkills: string[], missingSkills: string[], warnings?: string[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isEnriching, setIsEnriching] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
  const [hasAnalyzed, setHasAnalyzed] = React.useState(false);
  const [isPastingResume, setIsPastingResume] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setResumeFileName(file.name);
    setUploadError(null);
    
    try {
      const text = await pdfExtractionService.extractText(file);
      
      if (!text || text.trim().length < 100) {
        setUploadError("⚠️ Scanned PDF/Image Detected: We could not find a selectable text layer in your PDF. Please upload a digital PDF/Word document, or paste the text manually using the toggle above.");
        setResumeFileName(null);
        setResumeText('');
      } else {
        setResumeText(text);
        trackEvent('resume_upload_landing', { fileName: file.name });
      }
    } catch (err) {
      console.error("Extraction failed", err);
      setUploadError("⚠️ Extraction Failed: Something went wrong while parsing the document. Please try pasting the text manually.");
      setResumeFileName(null);
      setResumeText('');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobText || !resumeText) return;
    setIsAnalyzing(true);
    setIsEnriching(true);
    
    const startTime = Date.now();
    try {
      // 1. Fetch Vector Match Baseline (Fast)
      const vectorResult = await matchAnalysisService.calculateVectorMatch({
        jobDescription: jobText,
        resumeText: resumeText
      });
      
      // Step 16: Check if fallback is active and add a perception threshold delay
      const isFallback = vectorResult.warnings?.some((w: string) => 
        w.toLowerCase().includes('approximation') || 
        w.toLowerCase().includes('warning') || 
        w.toLowerCase().includes('limit')
      ) || false;
      
      if (isFallback) {
        const elapsedTime = Date.now() - startTime;
        const targetDelay = 900; // 900ms minimum threshold
        if (elapsedTime < targetDelay) {
          await new Promise(resolve => setTimeout(resolve, targetDelay - elapsedTime));
        }
      }

      // Immediately show score + CTA to user (Column 1 is now active)
      setResult({
        score: vectorResult.score,
        matchingSkills: [],
        missingSkills: [],
        warnings: vectorResult.warnings
      });
      setHasAnalyzed(true);
      setIsAnalyzing(false); // Stop loading skeletons for Column 1
      
      // Log instant match event
      trackEvent('landing_page_analysis_instant', { score: vectorResult.score });

      // 2. Fetch LLM Enrichment Asynchronously in background
      try {
        const enrichmentResult = await matchAnalysisService.getLLMEnrichment({
          jobDescription: jobText,
          resumeText: resumeText
        });
        
        setResult(prev => {
          if (!prev) return null;
          return {
            ...prev,
            matchingSkills: enrichmentResult.matchingSkills,
            missingSkills: enrichmentResult.missingSkills,
            warnings: enrichmentResult.warnings || prev.warnings
          };
        });

        trackEvent('landing_page_analysis_enriched', { score: vectorResult.score });
        trackEvent('aha_moment', { type: 'sandbox_match', score: vectorResult.score });
      } catch (llmErr) {
        console.warn("LLM enrichment failed in background, using fallback:", llmErr);

        const localResult = matchAnalysisService.calculateLocalMatchScore(
          jobText,
          resumeText
        );

        setResult(prev => {
          if (!prev) return null;

          return {
            ...prev,
            score: localResult.score,
            matchingSkills: localResult.matchingSkills || [],
            missingSkills: localResult.missingSkills || [],
            warnings: [
              ...(prev.warnings || []),
              "⚠️ AI enrichment failed. Showing local fallback analysis."
            ]
          };
        });
      } finally {
        setIsEnriching(false);
      }

    } catch (err: any) {
      console.error(err);
      setResult({
        score: 0,
        matchingSkills: [],
        missingSkills: [],
        warnings: [err.message || "Failed to analyze match score."]
      });
      setIsAnalyzing(false);
      setIsEnriching(false);
    }
  };

  // Smart Redirect: If already logged in, skip the landing page
  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-[#FC6100]/30 selection:text-[#FC6100]">
      {/* Navbar */}
      <nav className="h-24 flex items-center justify-between px-6 md:px-12 border-b border-white/5 sticky top-0 bg-[#0D0D0D]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
        <div className="w-14 h-14 flex items-center justify-center -ml-2">
          <img 
            src="/logo.png" 
            alt="Udyog Marg" 
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(252,97,0,0.3)]" 
          />
        </div>
          <span className="text-xl font-bold tracking-tight font-display">Udyog Marg</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Login</Link>
                  <button 
                    onClick={() => {
                      if (hasAnalyzed) {
                        trackEvent('join_alpha_clicked', { source: 'navbar_after_match' });
                        localStorage.setItem('udyog_marg_sandbox_state', JSON.stringify({
                          jobText,
                          resumeText,
                          timestamp: new Date().toISOString()
                        }));
                        window.location.href = '/signup';
                      }
                    }}
                    disabled={!hasAnalyzed}
                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border shadow-lg flex items-center gap-2 ${
                      hasAnalyzed 
                        ? 'bg-[#FC6100] hover:bg-[#E35205] border-[#FC6100]/30 text-white shadow-[#FC6100]/20 hover:scale-[1.02]' 
                        : 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                    title={!hasAnalyzed ? "Calculate match score below to unlock alpha registration" : "Click to claim your account"}
                  >
                    {hasAnalyzed ? 'Join Alpha 🚀' : '🔒 Locked: Try Demo'}
                  </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative px-6 overflow-hidden flex flex-col items-center justify-start transition-all duration-500 ease-in-out ${isSearching ? 'pt-6 pb-2' : 'pt-10 pb-4'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FC6100]/30 blur-[120px] -mr-48 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FC6100]/20 blur-[120px] -ml-48 -mb-24"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4 flex flex-col items-center">
          <div className={`inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full transition-all duration-500 ease-in-out overflow-hidden ${isSearching ? 'opacity-0 max-h-0 py-0 border-none mb-0' : 'opacity-100 max-h-12'}`}>
             <div className="w-2 h-2 bg-[#FC6100] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">The Job Search OS v1.0</span>
          </div>

          <h1 className={`font-bold tracking-tighter leading-[0.95] transition-all duration-500 ease-in-out ${isSearching ? 'text-2xl md:text-3xl' : 'text-4xl md:text-6xl'}`}>
            Stop searching.{!isSearching && <br />} Start <span className="text-[#FC6100] italic">Engineering.</span>
          </h1>

          <p className={`text-gray-400 max-w-2xl font-medium leading-relaxed transition-all duration-500 ease-in-out ${isSearching ? 'opacity-0 max-h-0 text-[0px] overflow-hidden mt-0' : 'opacity-100 max-h-24 text-sm md:text-base'}`}>
            Udyog Marg is the high-performance execution engine for your career. 
            Automate the boring, master the interview, and dominate your pipeline.
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-500 ease-in-out ${isSearching ? 'opacity-0 max-h-0 overflow-hidden pt-0 mt-0' : 'opacity-100 max-h-16 pt-1'}`}>
            <button 
              onClick={() => {
                setShowMatchModal(true);
                setTimeout(() => {
                  document.getElementById('demo-scanner-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              data-testid="hero-demo-cta"
              className="w-full sm:w-auto px-10 py-5 bg-[#FC6100] text-white text-sm font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#E35205] transition-all tactile-press border border-white/10 flex items-center justify-center gap-2"
            >
              Try the Live Demo <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
 
        {/* Value-First: Ultra-Fresh Tech Opportunities Grid */}
        <div className="w-full max-w-6xl mx-auto relative z-10 px-4 flex flex-col items-center" style={{ marginTop: '16px' }}>
          <div className="text-center flex flex-col items-center w-full max-w-2xl mx-auto mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FC6100]/10 border border-[#FC6100]/30 rounded-md mb-2">
              <span className="w-1.5 h-1.5 bg-[#FC6100] rounded-full animate-ping"></span>
              <span className="text-[8px] font-black uppercase tracking-widest text-[#FC6100]">Local Job Feed</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ marginBottom: '12px' }}>Live Job Matches</h2>
            
            <div className="w-full relative" style={{ marginBottom: '12px' }}>
              <input 
                type="text"
                placeholder="E.g. Frontend Engineer, DevOps, Product Manager..."
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                className="w-full px-6 py-4 h-16 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#FC6100]/50 transition-colors text-base leading-normal align-middle shadow-inner animate-in fade-in zoom-in-95 duration-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-semibold tracking-wide text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ marginTop: '16px', marginBottom: '20px' }}>
              <span>Prioritizing roles in your region:</span>
              {!isChangingLocation ? (
                <div className="flex items-center gap-2">
                  <span className="text-[#FC6100] bg-[#FC6100]/10 border border-[#FC6100]/30 px-3.5 py-1.5 rounded-full font-black flex items-center gap-2 shadow-sm text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#FC6100] animate-bounce" />
                    {detectedLocation}
                  </span>
                  <button 
                    onClick={() => {
                      setIsChangingLocation(true);
                      setPostalError('');
                    }}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-[#FC6100]/20 hover:text-white border border-white/10 hover:border-[#FC6100]/40 rounded-full text-[10px] text-gray-300 font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    change
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePostalLookup} className="flex items-center gap-2 tracking-normal lowercase font-bold">
                  <input 
                    type="text"
                    placeholder="Enter city, pincode, or postcode..."
                    value={postalInput}
                    onChange={(e) => setPostalInput(e.target.value)}
                    disabled={isLoadingPostal}
                    className="px-3 py-1.5 bg-black/60 border border-[#FC6100]/30 focus:border-[#FC6100] rounded text-xs text-white placeholder-gray-600 focus:outline-none w-56 tracking-normal normal-case"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    disabled={isLoadingPostal}
                    className="px-3 py-1.5 bg-[#FC6100] hover:bg-[#E35205] text-white text-[10px] font-black uppercase tracking-wider rounded transition-all shadow-sm"
                  >
                    {isLoadingPostal ? '...' : 'Verify'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsChangingLocation(false);
                      setPostalInput('');
                      setPostalError('');
                    }}
                    className="text-[10px] text-gray-400 hover:text-white uppercase tracking-wider transition-colors ml-1 font-bold"
                  >
                    cancel
                  </button>
                </form>
              )}
              {postalError && (
                <span className="text-red-500 lowercase tracking-normal normal-case font-medium ml-2">{postalError}</span>
              )}
            </div>
          </div>

          {searchRole.trim().length < 2 ? (
            <div className="w-full flex flex-col items-center justify-center py-20 px-8 bg-white/[0.01] border border-white/5 rounded-[32px] text-center max-w-2xl mx-auto space-y-6" style={{ marginTop: '20px' }}>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FC6100]">
                <Globe className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Discover Regional Targets</h3>
                <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                  Type your target role or key skills above to retrieve live matches matching your background in <span className="text-white font-semibold">{detectedLocation}</span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in duration-300" style={{ marginTop: '12px' }}>
              {isSearchingLive ? (
                <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-gray-500">
                  <div className="w-8 h-8 border-4 border-[#FC6100]/20 border-t-[#FC6100] rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-medium animate-pulse text-[#FC6100]">Scanning real-time job market for "{searchRole}"...</p>
                </div>
              ) : liveJobs.length > 0 ? (
                liveJobs.map((job: any) => (
                  <div 
                    key={job.id}
                    className="bg-white/[0.02] border border-white/5 hover:border-[#FC6100]/30 hover:bg-[#FC6100]/[0.01] rounded-[20px] transition-all duration-300 flex flex-col h-full group/card relative overflow-hidden"
                    style={{ padding: '1.5rem' }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FC6100]/5 blur-2xl rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                    
                    <div className="flex flex-col gap-4 relative z-10 flex-1">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-4 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-[#FC6100] group-hover/card:bg-[#FC6100] group-hover/card:text-white transition-all uppercase shadow-md shrink-0">
                            {job.company_name.substring(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest leading-none truncate">{job.company_name}</p>
                            <h3 className="text-base font-bold text-white mt-1.5 group-hover/card:text-[#FC6100] transition-colors leading-tight truncate">{job.title}</h3>
                          </div>
                        </div>
                        {job.match_label && (
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-md shrink-0 tracking-widest ${job.match_label === 'Strong Match' ? 'text-[#FC6100] bg-[#FC6100]/10 border border-[#FC6100]/30' : 'text-green-500 bg-green-500/10 border border-green-500/30'}`}>
                            {job.match_label}
                          </span>
                        )}
                      </div>

                      {/* Location & Tags */}
                      <div className="flex flex-col gap-3">
                        <p className="text-[9px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider leading-none truncate">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                          {job.location}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {job.description ? job.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between relative z-10 shrink-0">
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest group-hover/card:text-[#FC6100] transition-colors truncate pr-2">Verify ATS Fit & Gaps</span>
                      <button 
                        onClick={() => handleSelectJob(job)}
                        className="px-5 py-2.5 bg-[#FC6100] hover:bg-[#E35205] text-white text-[8px] font-black uppercase tracking-widest rounded-md transition-all border border-white/10 shadow-lg shadow-[#FC6100]/5 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                      >
                        Calculate Match ⚡
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-gray-500">
                  <p className="text-sm font-medium">No direct matches found. Try broadening your search or modifying your location.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Match Scanner Modal */}
        {showMatchModal && (
          <div className="fixed inset-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="w-full max-w-5xl bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 md:p-12 relative shadow-[0_20px_50px_rgba(252,97,0,0.15)] animate-in zoom-in-95 duration-300 my-auto">
              
              <button 
                onClick={() => setShowMatchModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all z-[60] font-black text-sm hover:scale-110"
                title="Close Scanner"
              >
                ✕
              </button>

              <div className="text-center space-y-2 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Sovereign Sandbox</p>
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight">Match Intelligence Scanner</h3>
              </div>

              {/* Visual Stepper Pathway */}
              <div id="demo-scanner-section" className="w-full max-w-4xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${jobText ? 'bg-[#FC6100]/5 border-[#FC6100]/30 shadow-[0_0_15px_rgba(252,97,0,0.05)]' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${jobText ? 'bg-[#FC6100] text-white shadow-[0_0_8px_rgba(252,97,0,0.4)]' : 'bg-white/10 text-gray-500'}`}>01</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Step 1</p>
                <p className="text-xs font-bold text-white mt-0.5">Paste Job Details</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 ${resumeText ? 'bg-[#FC6100]/5 border-[#FC6100]/30 shadow-[0_0_15px_rgba(252,97,0,0.05)]' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${resumeText ? 'bg-[#FC6100] text-white' : 'bg-white/10 text-gray-500'}`}>02</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Step 2</p>
                <p className="text-xs font-bold text-white mt-0.5">Provide Resume</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 ${hasAnalyzed ? 'bg-green-500/5 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${hasAnalyzed ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-500'}`}>03</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Step 3</p>
                <p className="text-xs font-bold text-white mt-0.5">Unlock & Customize</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Match Widget - Radical Value */}
        <div id="demo-widget" className="w-full max-w-4xl mx-auto bg-white/[0.03] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in duration-1000 delay-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 w-full">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${jobText ? 'bg-[#FC6100]/20 border-[#FC6100]/50 text-[#FC6100]' : 'bg-white/5 border-white/10 text-gray-500'}`}>01</span>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Paste Job Description</label>
                {isScrapingFullDesc && (
                  <span className="text-[9px] font-bold text-[#FC6100] animate-pulse flex items-center gap-1.5 ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FC6100] animate-ping" />
                    Hydrating Full JD...
                  </span>
                )}
              </div>
              <textarea 
                value={jobText}
                data-testid="demo-job-textarea"
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the requirements section here..."
                className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm focus:border-[#FC6100]/50 transition-colors resize-none placeholder:text-gray-700 scrollbar-hide"
              />
            </div>
            
            {/* Step 2 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${resumeText ? 'bg-[#FC6100]/20 border-[#FC6100]/50 text-[#FC6100]' : 'bg-white/5 border-white/10 text-gray-500'}`}>02</span>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {isPastingResume ? 'Paste Your Resume' : 'Upload Your Resume (PDF or Word)'}
                  </label>
                </div>
                <button 
                  onClick={() => {
                    setIsPastingResume(!isPastingResume);
                    setResumeText('');
                    setResumeFileName(null);
                    setUploadError(null);
                  }}
                  className="text-[9px] font-black uppercase tracking-widest text-[#FC6100] hover:underline"
                >
                  {isPastingResume ? 'Switch to Document Upload' : 'Don\'t have a PDF or Word file? Paste Text'}
                </button>
              </div>

              {isPastingResume ? (
                <textarea 
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume or LinkedIn profile text here..."
                  className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm focus:border-[#FC6100]/50 transition-colors resize-none placeholder:text-gray-700 scrollbar-hide"
                />
              ) : (
                <div className="relative group/upload h-48 bg-black/40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:border-[#FC6100]/30 overflow-hidden">
                  <input 
                    type="file" 
                    accept=".pdf,.docx"
                    data-testid="demo-resume-upload"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  
                  {isExtracting ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#FC6100] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Extracting Data...</p>
                    </div>
                  ) : resumeFileName ? (
                    <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                      <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                        <Target className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-xs font-bold text-white truncate max-w-[200px]">{resumeFileName}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setResumeFileName(null); setResumeText(''); setUploadError(null); }}
                        className="text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 relative z-20"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white/5 rounded-xl group-hover/upload:bg-[#FC6100]/10 transition-colors">
                        <Layers className="w-6 h-6 text-gray-500 group-hover/upload:text-[#FC6100] transition-colors" />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-xs font-bold text-white">Drag or Click to Upload</p>
                        <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest mt-1">PDF or Word (.docx)</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="text-[10px] font-semibold text-red-400 bg-red-950/20 border border-red-500/15 rounded-2xl p-4 animate-in fade-in slide-in-from-top-1 duration-300 leading-normal">
                  {uploadError}
                </div>
              )}
              
              {!resumeText && !resumeFileName && !isPastingResume && (
                <button 
                  onClick={() => {
                    setResumeText("Standard Software Engineer with expertise in React, Node.js, and Cloud Infrastructure.");
                    setResumeFileName("Sample_Engineer_Resume.pdf");
                    trackEvent('demo_sample_resume_used');
                  }}
                  className="w-full py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  Or Try with Sample Resume
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-8">
            <button 
              onClick={handleAnalyze}
              data-testid="demo-analyze-btn"
              disabled={!jobText || !resumeText || isAnalyzing}
              className={`px-12 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-full hover:bg-gray-200 transition-all tactile-press disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isAnalyzing ? 'Analyzing Algorithm...' : 'Calculate ATS Match'}
            </button>

            {(result || isAnalyzing) && (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 justify-center">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${result && !isEnriching ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-white/5 border-white/10 text-gray-500 animate-pulse'}`}>03</span>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {isAnalyzing || isEnriching ? 'Analyzing Alignment' : 'The Verdict'}
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Column 1 (Hero Metric Card) */}
                  {isAnalyzing ? (
                    <div className="bg-white/[0.05] border border-white/10 rounded-[24px] p-6 text-center flex flex-col justify-between space-y-6 opacity-60">
                      {/* Header */}
                      <div className="flex items-center justify-between text-[8px] font-mono text-gray-600 uppercase tracking-widest border-b border-white/5 pb-2 w-full">
                        <span>System KPI</span>
                        <span>ATS_SCAN_V1</span>
                      </div>
                      
                      {/* Enclosure Skeleton */}
                      <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4 w-full flex flex-col items-center">
                        <div className="animate-pulse">
                          <p className="text-7xl font-bold text-gray-800 tracking-tighter leading-none">--%</p>
                          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 mt-2">Computing Fit...</p>
                        </div>
                        <div className="inline-block px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-wider rounded-md border border-white/5 text-gray-600 bg-white/5 animate-pulse">
                          ● Parsing Data...
                        </div>
                      </div>

                      <div className="w-full border-t border-white/5 my-4"></div>

                      {/* Locked placeholder */}
                      <div className="flex flex-col items-center justify-center p-4 border border-dashed border-white/5 rounded-xl w-full bg-white/[0.01]">
                        <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-gray-600 flex items-center gap-1.5 animate-pulse">
                          🔒 Pipeline Locked
                        </span>
                        <span className="text-[7px] text-gray-700 font-mono mt-1">Awaiting scanner readout...</span>
                      </div>
                    </div>
                  ) : result && (
                    <div className="bg-white/[0.08] border border-[#FC6100]/35 rounded-[24px] p-6 text-center flex flex-col justify-between space-y-6 shadow-[0_0_40px_rgba(252,97,0,0.08)]">
                      {/* Header */}
                      <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 w-full">
                        <span>System KPI</span>
                        <span>ATS_SCAN_V1</span>
                      </div>

                      {/* Unified System Enclosure (Metric + Controls) */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-5 shadow-inner w-full flex flex-col items-center">
                        
                        {/* Metric Section */}
                        <div className="space-y-3 flex flex-col items-center w-full">
                          <div>
                            <p className="text-7xl font-bold text-[#FC6100] tracking-tighter leading-none">{result.score}%</p>
                            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-500 mt-2">Match Accuracy</p>
                            {(() => {
                        const isFallback = result.warnings?.some((w: string) => 
                          w.toLowerCase().includes('approximation') || 
                          w.toLowerCase().includes('warning') || 
                          w.toLowerCase().includes('limit')
                        ) || false;
                        
                        let label = '● System Scan Active';
                        let colorClass = 'text-green-500 bg-green-500/10 border-green-500/20';
                        
                        if (isFallback) {
                          label = '▲ Local Scan (Approximate)';
                          colorClass = 'text-[#FC6100]/80 bg-[#FC6100]/5 border-[#FC6100]/20';
                        } else if (result.score >= 80) {
                          label = '● System Scan Active (Optimal)';
                          colorClass = 'text-green-500 bg-green-500/10 border-green-500/20';
                        } else if (result.score >= 60) {
                          label = '▲ System Scan Active (Compatible)';
                          colorClass = 'text-[#FC6100] bg-[#FC6100]/10 border-[#FC6100]/20';
                        } else {
                          label = '■ System Scan Active (Critical)';
                          colorClass = 'text-red-500 bg-red-500/10 border-red-500/20';
                        }
                        
                        return (
                          <div className={`inline-block px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-wider rounded-md border ${colorClass}`}>
                            {label}
                          </div>
                        );
                      })()}
                          </div>
                        </div>

                        {/* Internal Enclosure Divider */}
                        <div className="w-full border-t border-white/5 my-4"></div>

                        {/* Action Control Section - High-Tension Execution Zone */}
                        <div className="flex flex-col items-center space-y-3 w-full bg-[#FC6100]/5 border border-[#FC6100]/20 rounded-xl p-4 shadow-[0_0_15px_rgba(252,97,0,0.05)] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                          {(() => {
                            const isFallback = result.warnings?.some((w: string) => 
                              w.toLowerCase().includes('approximation') || 
                              w.toLowerCase().includes('warning') || 
                              w.toLowerCase().includes('limit')
                            ) || false;
                            
                            const isMediumConfidence = !isFallback && result.score < 80;

                            if (!session) {
                              let btnLabel = 'Claim Free Account';
                              let subText = 'Auto-saves state to generate cover letters & resume variants.';
                              
                              if (isFallback) {
                                btnLabel = 'Refine Resume & Re-run Scan';
                                subText = 'Runs local parsing now. Sign up to unlock complete AI scoring.';
                              } else if (isMediumConfidence) {
                                btnLabel = 'Claim & Optimize Profile';
                                subText = 'Unlock AI tailoring suggestions to bridge these missing gaps.';
                              }
                              
                              return (
                                <>
                                  <button 
                                    data-testid="demo-signup-cta"
                                    onClick={() => {
                                      trackEvent('cta_click', { location: 'sandbox_result_inline' });
                                      localStorage.setItem('udyog_marg_sandbox_state', JSON.stringify({
                                        jobText,
                                        resumeText,
                                        timestamp: new Date().toISOString()
                                      }));
                                      setTimeout(() => {
                                        window.location.href = '/signup';
                                      }, 50);
                                    }}
                                    className="px-6 py-3 bg-[#FC6100] hover:bg-[#E35205] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 shadow-lg shadow-[#FC6100]/20 flex items-center justify-center gap-1.5 hover:scale-[1.02] w-full"
                                  >
                                    {btnLabel} <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                  <p className="text-[8px] text-gray-500 leading-normal max-w-[200px] mx-auto">
                                    {subText}
                                  </p>
                                </>
                              );
                            } else {
                              if (isJobSaved) {
                                return (
                                  <div className="flex flex-col gap-2 w-full">
                                    <div className="py-2.5 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-green-500/20 text-center w-full">
                                      ✓ Saved to Pipeline
                                    </div>
                                    <button 
                                      onClick={() => navigate('/pipeline')}
                                      className="py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-center border border-white/5 w-full"
                                    >
                                      View Pipeline
                                    </button>
                                  </div>
                                );
                              } else {
                                let btnLabel = 'Save to Pipeline ⚡';
                                let subText = 'Injects this target profile directly into your tracking board.';
                                
                                if (isFallback) {
                                  btnLabel = 'Refine & Re-run Scan ⚡';
                                  subText = 'Saves target profile. Refine inputs above to restart AI alignment.';
                                } else if (isMediumConfidence) {
                                  btnLabel = 'Save & Improve Match ⚡';
                                  subText = 'Saves profile and begins tracking steps to optimize missing skills.';
                                }
                                
                                return (
                                  <>
                                    <button 
                                      data-testid="demo-save-cta"
                                      onClick={handleSaveJob}
                                      disabled={isSaving}
                                      className="py-3 bg-[#FC6100] hover:bg-[#E35205] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 shadow-lg flex items-center justify-center gap-1.5 hover:scale-[1.02] w-full disabled:opacity-50"
                                    >
                                      {isSaving ? 'Saving...' : btnLabel}
                                    </button>
                                    <p className="text-[8px] text-gray-500 leading-normal max-w-[220px] mx-auto">
                                      {subText}
                                    </p>
                                  </>
                                );
                              }
                            }
                          })()}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Column 2 (Matching Skills Card) */}
                  {(isAnalyzing || isEnriching) ? (
                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 space-y-4 opacity-50">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Matching Skills</p>
                      <div className="flex flex-wrap gap-2 animate-pulse">
                        <div className="w-16 h-7 bg-white/5 rounded-lg border border-white/5"></div>
                        <div className="w-24 h-7 bg-white/5 rounded-lg border border-white/5"></div>
                        <div className="w-20 h-7 bg-white/5 rounded-lg border border-white/5"></div>
                      </div>
                    </div>
                  ) : result && (
                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00FF00]">Matching Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {result.matchingSkills.length > 0 ? result.matchingSkills.map(s => (
                          <span key={s} className="px-3 py-1.5 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 text-[10px] font-black uppercase tracking-wider rounded-lg">{s}</span>
                        )) : <span className="text-xs text-gray-600 italic">No matches detected.</span>}
                      </div>
                    </div>
                  )}

                  {/* Column 3 (Critical Gaps Card) */}
                  {(isAnalyzing || isEnriching) ? (
                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 space-y-4 opacity-50">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Critical Gaps</p>
                      <div className="flex flex-wrap gap-2 animate-pulse">
                        <div className="w-20 h-7 bg-white/5 rounded-lg border border-white/5"></div>
                        <div className="w-14 h-7 bg-white/5 rounded-lg border border-white/5"></div>
                        <div className="w-28 h-7 bg-white/5 rounded-lg border border-white/5"></div>
                      </div>
                    </div>
                  ) : result && (
                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Critical Gaps</p>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.length > 0 ? result.missingSkills.map(s => (
                          <span key={s} className="px-3 py-1.5 bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-wider rounded-lg">{s}</span>
                        )) : <span className="text-xs text-gray-600 italic">None! Ready to apply.</span>}
                      </div>
                    </div>
                  )}

                </div>

                {!isAnalyzing && (
                  <div className="pt-6 text-center">
                    <button 
                      onClick={() => setShowScanner(!showScanner)}
                      className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                      {showScanner ? 'Hide Technical Scan' : 'View Intelligence Scanner Output'}
                    </button>
                  </div>
                )}

                {/* The Delta Scanner View (Hidden by default) */}
                {showScanner && result && (
                  <div className="md:col-span-3 pt-8 space-y-6 animate-in fade-in zoom-in duration-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 text-center">Scanner Analysis</p>
                    <div className="p-8 bg-black/60 border border-white/5 rounded-3xl text-sm leading-relaxed text-gray-400 max-h-64 overflow-y-auto font-mono scrollbar-hide">
                      {(() => {
                        const allTerms = [
                          ...(result?.matchingSkills ?? []),
                          ...(result?.missingSkills ?? [])
                        ].flatMap(skill => {
                          return [skill, ...(SYNONYMS[skill] || [])];
                        });
                        allTerms.sort((a, b) => b.length - a.length);
                        const combinedRegex = new RegExp(`(${allTerms.map(t => {
                          const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                          const leading = /^\w/.test(t) ? '\\b' : '(?<=^|\\s|\\p{P})';
                          const trailing = /\w$/.test(t) ? '\\b' : '(?=$|\\s|\\p{P})';
                          return `${leading}${escaped}${trailing}`;
                        }).join('|')})`, 'gi');
                        return jobText.split(combinedRegex).map((part, index) => {
                          const lowerPart = part.toLowerCase();
                          const isMatch = (result?.matchingSkills ?? []).some(s => {
                            return s.toLowerCase() === lowerPart || (SYNONYMS[s] || []).some(syn => syn.toLowerCase() === lowerPart);
                          });
                          const isMissing = (result?.missingSkills ?? []).some(s => {
                            return s.toLowerCase() === lowerPart || (SYNONYMS[s] || []).some(syn => syn.toLowerCase() === lowerPart);
                          });
                          if (isMatch) return <span key={index} className="text-[#00FF00] bg-[#00FF00]/10 px-1 rounded font-bold">{part}</span>;
                          if (isMissing) return <span key={index} className="text-white border-b border-white/40">{part}</span>;
                          return part;
                        });
                      })()}
                    </div>

                    {/* Match Math - Dynamic Points Explainer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#FC6100]">Weighted Match Formula</p>
                        <div className="space-y-2 text-[10px] text-gray-500 font-mono leading-relaxed">
                          <p>We weigh core industry requirements higher than secondary keywords to prevent the "laundry list" penalty:</p>
                          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                            <div className="flex justify-between text-white font-bold">
                              <span>Total Possible Weight:</span>
                              <span>{(() => {
                                let total = 0;
                                [...result.matchingSkills, ...result.missingSkills].forEach(s => {
                                  total += KEYWORD_WEIGHTS[s.toLowerCase()] || 1;
                                });
                                return total.toFixed(1);
                              })()} pts</span>
                            </div>
                            <div className="flex justify-between text-[#00FF00] font-bold">
                              <span>Earned Match Weight:</span>
                              <span>{(() => {
                                let earned = 0;
                                result.matchingSkills.forEach(s => {
                                  earned += KEYWORD_WEIGHTS[s.toLowerCase()] || 1;
                                });
                                return earned.toFixed(1);
                              })()} pts</span>
                            </div>
                            <div className="border-t border-white/5 my-1.5" />
                            <div className="flex justify-between text-gray-400">
                              <span>Raw Keyword Ratio:</span>
                              <span>{(() => {
                                let total = 0;
                                let earned = 0;
                                [...result.matchingSkills, ...result.missingSkills].forEach(s => {
                                  total += KEYWORD_WEIGHTS[s.toLowerCase()] || 1;
                                });
                                result.matchingSkills.forEach(s => {
                                  earned += KEYWORD_WEIGHTS[s.toLowerCase()] || 1;
                                });
                                return total > 0 ? `${Math.round((earned / total) * 100)}%` : '0%';
                              })()}</span>
                            </div>
                            <div className="flex justify-between text-white font-black">
                              <span>Calibrated Match:</span>
                              <span>{result.score}% (Weighted Curves Applied)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white">Skills Weight Breakdown</p>
                        <div className="max-h-[160px] overflow-y-auto space-y-2 text-[9px] font-mono scrollbar-hide">
                          {result.matchingSkills.map(s => {
                            const weight = KEYWORD_WEIGHTS[s.toLowerCase()] || 1;
                            return (
                              <div key={s} className="flex justify-between items-center text-[#00FF00]/80">
                                <span>{s} (Match)</span>
                                <span>+{weight.toFixed(1)} pts</span>
                              </div>
                            );
                          })}
                          {result.missingSkills.map(s => {
                            const weight = KEYWORD_WEIGHTS[s.toLowerCase()] || 1;
                            return (
                              <div key={s} className="flex justify-between items-center text-gray-500">
                                <span>{s} (Gap)</span>
                                <span>0.0 / {weight.toFixed(1)} pts</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Intelligence Core - Visual Demo */}
      <section className="py-64 px-6 relative overflow-hidden flex flex-col items-center bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center space-y-20 flex flex-col items-center relative z-10">
          <div className="space-y-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-full mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Matching System (Live Now)</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight text-center">
              Know your fit.<br />
              Before you <span className="text-[#FC6100] italic">Apply.</span>
            </h2>
            <p className="text-2xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto text-center">
              Udyog Marg analyzes the difference between your resume and the job description in real-time. Get an accurate match score, identify missing keywords, and prepare your application for the win.
            </p>
          </div>

          <div className="relative group w-full max-w-2xl mx-auto py-10">
            <div className="absolute inset-0 bg-[#FC6100]/10 blur-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img 
              src="./landing/match_intelligence_demo.png" 
              alt="Match Intelligence Demo" 
              className="relative rounded-[40px] border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.01] z-10 mx-auto w-full h-auto object-contain"
            />
          </div>

          <div className="grid grid-cols-3 gap-16 pt-16 w-full max-w-3xl border-t border-white/10 mx-auto mb-32">
            <div className="space-y-4 text-center">
              <p className="text-5xl font-bold text-white tracking-tighter">87%</p>
              <p className="text-[12px] font-black text-gray-600 uppercase tracking-widest">Match Accuracy</p>
            </div>
            <div className="space-y-4 border-x border-white/10 text-center">
              <p className="text-5xl font-bold text-white tracking-tighter">100%</p>
              <p className="text-[12px] font-black text-gray-600 uppercase tracking-widest">Privacy Secured</p>
            </div>
            <div className="space-y-4 text-center">
              <p className="text-5xl font-bold text-white tracking-tighter">AI</p>
              <p className="text-[12px] font-black text-gray-600 uppercase tracking-widest">Powered Insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Symmetric Expansion Zone */}
      <div className="h-64 w-full bg-transparent"></div>

      {/* Feature Grid */}
      <section id="features" className="py-64 px-6 bg-white/[0.02] border-y border-white/5 flex flex-col items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-32">
          <div className="flex flex-col items-center text-center space-y-10 group w-full">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500 shadow-2xl group-hover:shadow-[#FC6100]/20 mx-auto">
              <Zap className="w-12 h-12 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold tracking-tight text-center">Universal Importer</h3>
              <p className="text-gray-400 leading-relaxed font-medium max-w-[320px] mx-auto text-center text-lg">
                Paste any LinkedIn or Indeed URL. Our engine scrapes the data in seconds, building your pipeline with zero manual entry.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-10 group w-full">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500 shadow-2xl group-hover:shadow-[#FC6100]/20 mx-auto">
              <Target className="w-12 h-12 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold tracking-tight text-center">Match Intelligence</h3>
              <p className="text-gray-400 leading-relaxed font-medium max-w-[320px] mx-auto text-center text-lg">
                Real-time analysis between your resume and the job description. Know your fit percentage and missing keywords instantly.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-10 group w-full">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500 shadow-2xl group-hover:shadow-[#FC6100]/20 mx-auto">
              <Cpu className="w-12 h-12 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold tracking-tight text-center">Interview Prep Mode</h3>
              <p className="text-gray-400 leading-relaxed font-medium max-w-[320px] mx-auto text-center text-lg">
                Personalized prep guides, "Trap" question strategies, and AI-drafted elevator pitches tailored to your specific resume gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Symmetric Expansion Zone */}
      <div className="h-64 w-full bg-transparent"></div>

      {/* Social Proof Placeholder */}
      <section className="py-48 px-6 bg-black flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-24">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">Engineered for the 1%.</h2>
          <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-12 opacity-20 grayscale hover:grayscale-0 transition-all duration-700 w-full">
             <div className="font-black text-xl md:text-3xl italic tracking-tighter whitespace-nowrap">TECH CRUNCH</div>
             <div className="font-black text-xl md:text-3xl italic tracking-tighter whitespace-nowrap">PRODUCT HUNT</div>
             <div className="font-black text-xl md:text-3xl italic tracking-tighter whitespace-nowrap">HACKER NEWS</div>
             <div className="font-black text-xl md:text-3xl italic tracking-tighter whitespace-nowrap">THE VERGE</div>
          </div>
        </div>
      </section>

      {/* Final Expansion Zone */}
      <div className="h-64 w-full bg-transparent"></div>

      {/* Footer */}
      <footer className="py-40 px-6 border-t border-white/5 bg-black flex flex-col items-center w-full">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-20 text-center">
          <div className="space-y-6 flex flex-col items-center">
            <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 flex items-center justify-center mx-auto">
              <img src="/logo.png" alt="Udyog Marg" className="w-full h-full object-contain" />
            </div>
              <span className="text-2xl font-bold tracking-tight">Udyog Marg</span>
            </div>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] max-w-sm mx-auto text-center">Build your legacy. Dominate the hunt.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 w-full">
            <Link to="/legal#privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/legal#terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/legal#security" className="hover:text-white transition-colors">Security Audit</Link>
          </div>
          
          <div className="pt-12 border-t border-white/5 w-full flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              <Globe className="w-4 h-4 text-[#FC6100]" />
              Deployed in London, UK
            </div>
            <p className="text-[9px] font-bold text-gray-800 uppercase tracking-widest">&copy; 2026 Udyog Marg AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
