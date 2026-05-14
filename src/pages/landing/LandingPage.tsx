import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Layers, 
  ArrowRight, 
  Zap, 
  Target, 
  Cpu, 
  Globe
} from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { matchAnalysisService, SYNONYMS } from '../../features/jobs/services/matchAnalysisService';
import { pdfExtractionService } from '../../features/resumes/services/pdfExtractionService';

export const LandingPage: React.FC = () => {
  const { session, isLoading } = useAuth();
  
  // Widget State
  const [jobText, setJobText] = React.useState('');
  const [resumeText, setResumeText] = React.useState('');
  const [resumeFileName, setResumeFileName] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ score: number, matchingSkills: string[], missingSkills: string[], warnings?: string[] } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
  const [hasAnalyzed, setHasAnalyzed] = React.useState(false);
  const [isPastingResume, setIsPastingResume] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setResumeFileName(file.name);
    
    try {
      const text = await pdfExtractionService.extractText(file);
      setResumeText(text);
      trackEvent('resume_upload_landing', { fileName: file.name });
    } catch (err) {
      console.error("Extraction failed", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = () => {
    if (!jobText || !resumeText) return;
    setIsAnalyzing(true);
    
    // Simulate a brief "processing" for effect
    setTimeout(() => {
      const analysis = matchAnalysisService.calculateMatchScore(jobText, resumeText);
      setResult(analysis);
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      
      // Critical GTM Sync: Capture this as an 'Aha! Moment' for the dashboard
      trackEvent('landing_page_analysis', { score: analysis.score });
      trackEvent('aha_moment', { type: 'sandbox_match', score: analysis.score });
    }, 800);
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
                      if (jobText || resumeText) {
                        localStorage.setItem('udyog_marg_sandbox_state', JSON.stringify({
                          jobText,
                          resumeText,
                          timestamp: new Date().toISOString()
                        }));
                      }
                      window.location.href = '/signup';
                    }}
                    disabled={!hasAnalyzed}
                    className={`px-6 py-2.5 text-white text-[11px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/10 shadow-lg ${
                      hasAnalyzed 
                        ? 'bg-[#FC6100] hover:bg-[#E35205] shadow-[#FC6100]/20' 
                        : 'bg-white/5 text-gray-500 cursor-not-allowed grayscale opacity-50'
                    }`}
                  >
                    Join Alpha
                  </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FC6100]/30 blur-[120px] -mr-48 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FC6100]/20 blur-[120px] -ml-48 -mb-24"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="w-2 h-2 bg-[#FC6100] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">The Job Search OS v1.0</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Stop searching.<br />
            Start <span className="text-[#FC6100] italic">Engineering.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            Udyog Marg is the high-performance execution engine for your career. 
            Automate the boring, master the interview, and dominate your pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300 w-full sm:w-auto">
            <button 
              onClick={() => document.getElementById('demo-widget')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="hero-demo-cta"
              className="w-full sm:w-auto px-10 py-5 bg-[#FC6100] text-white text-sm font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#E35205] transition-all tactile-press border border-white/10 flex items-center justify-center gap-2"
            >
              Try the Live Demo <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Match Widget - Radical Value */}
        <div id="demo-widget" className="mt-24 w-full max-w-4xl mx-auto bg-white/[0.03] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in duration-1000 delay-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FC6100]/20 border border-[#FC6100]/40 flex items-center justify-center text-[#FC6100] text-[10px] font-black">1</div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Paste Job Description</label>
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
                  <div className="w-6 h-6 rounded-full bg-[#FC6100]/20 border border-[#FC6100]/40 flex items-center justify-center text-[#FC6100] text-[10px] font-black">2</div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {isPastingResume ? 'Paste Your Resume' : 'Upload Your Resume (PDF)'}
                  </label>
                </div>
                <button 
                  onClick={() => {
                    setIsPastingResume(!isPastingResume);
                    setResumeText('');
                    setResumeFileName(null);
                  }}
                  className="text-[9px] font-black uppercase tracking-widest text-[#FC6100] hover:underline"
                >
                  {isPastingResume ? 'Switch to PDF Upload' : 'Don\'t have a PDF? Paste Text'}
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
                    accept=".pdf"
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
                        onClick={(e) => { e.stopPropagation(); setResumeFileName(null); setResumeText(''); }}
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
                        <p className="text-[9px] font-medium text-gray-600 uppercase tracking-widest mt-1">PDF Resumes Only</p>
                      </div>
                    </>
                  )}
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

            {result && (
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-6 h-6 rounded-full bg-[#FC6100]/20 border border-[#FC6100]/40 flex items-center justify-center text-[#FC6100] text-[10px] font-black">3</div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">The Verdict</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 text-center flex flex-col items-center justify-center space-y-2">
                    <p className="text-6xl font-bold text-[#FC6100] tracking-tighter">{result.score}%</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Match Accuracy</p>
                  </div>
                
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00FF00]">Matching Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {result.matchingSkills.length > 0 ? result.matchingSkills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 text-[10px] font-black uppercase tracking-wider rounded-lg">{s}</span>
                    )) : <span className="text-xs text-gray-600 italic">No matches detected.</span>}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Critical Gaps</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.length > 0 ? result.missingSkills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-wider rounded-lg">{s}</span>
                    )) : <span className="text-xs text-gray-600 italic">None! Ready to apply.</span>}
                  </div>
                </div>

              </div>

                {/* The Conversion Hook */}
                <div className="md:col-span-3 pt-6 text-center space-y-6 border-t border-white/5 mt-4">
                   <p className="text-sm text-gray-400 italic font-medium">
                     "Now that you know what's missing, want to track this application and generate a tailored cover letter?"
                   </p>
                    <button 
                     data-testid="demo-signup-cta"
                     onClick={() => {
                       trackEvent('cta_click', { location: 'sandbox_result' });
                       
                       // PERSIST SANDBOX STATE
                       localStorage.setItem('udyog_marg_sandbox_state', JSON.stringify({
                         jobText,
                         resumeText,
                         timestamp: new Date().toISOString()
                       }));

                       // Force a small delay to ensure storage write before navigation
                       setTimeout(() => {
                         window.location.href = '/signup';
                       }, 50);
                     }}
                     className="inline-flex items-center gap-2 text-[#FC6100] text-xs font-black uppercase tracking-widest hover:gap-4 transition-all"
                    >
                      Join the Alpha to Automate Your Search <ArrowRight className="w-4 h-4" />
                    </button>
                   
                   <div className="pt-4">
                     <button 
                       onClick={() => setShowScanner(!showScanner)}
                       className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                     >
                       {showScanner ? 'Hide Technical Scan' : 'View Intelligence Scanner Output'}
                     </button>
                   </div>
                </div>

                {/* The Delta Scanner View (Hidden by default) */}
                {showScanner && (
                  <div className="md:col-span-3 pt-8 space-y-6 animate-in fade-in zoom-in duration-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 text-center">Scanner Analysis</p>
                    <div className="p-8 bg-black/60 border border-white/5 rounded-3xl text-sm leading-relaxed text-gray-400 max-h-64 overflow-y-auto font-mono scrollbar-hide">
                      {(() => {
                        const allTerms = [
                          ...result.matchingSkills,
                          ...result.missingSkills
                        ].flatMap(skill => {
                          return [skill, ...(SYNONYMS[skill] || [])];
                        });
                        allTerms.sort((a, b) => b.length - a.length);
                        const combinedRegex = new RegExp(`(${allTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
                        return jobText.split(combinedRegex).map((part, index) => {
                          const lowerPart = part.toLowerCase();
                          const isMatch = result.matchingSkills.some(s => {
                            return s.toLowerCase() === lowerPart || (SYNONYMS[s] || []).some(syn => syn.toLowerCase() === lowerPart);
                          });
                          const isMissing = result.missingSkills.some(s => {
                            return s.toLowerCase() === lowerPart || (SYNONYMS[s] || []).some(syn => syn.toLowerCase() === lowerPart);
                          });
                          if (isMatch) return <span key={index} className="text-[#00FF00] bg-[#00FF00]/10 px-1 rounded font-bold">{part}</span>;
                          if (isMissing) return <span key={index} className="text-white border-b border-white/40">{part}</span>;
                          return part;
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
