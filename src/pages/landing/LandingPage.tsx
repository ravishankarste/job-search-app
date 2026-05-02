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

export const LandingPage: React.FC = () => {
  const { session, isLoading } = useAuth();

  // Smart Redirect: If already logged in, skip the landing page
  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-[#FC6100]/30 selection:text-[#FC6100]">
      {/* Navbar */}
      <nav className="h-24 flex items-center justify-between px-6 md:px-12 border-b border-white/5 sticky top-0 bg-[#0D0D0D]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FC6100] rounded-lg flex items-center justify-center border border-white/10">
            <Layers className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight font-display">Udyog Marg</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link 
            to="/signup" 
            onClick={() => trackEvent('cta_click', { location: 'navbar' })}
            className="px-6 py-2.5 bg-[#FC6100] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-[#E35205] transition-all tactile-press border border-white/10"
          >
            Join Alpha
          </Link>
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
            <Link 
              to="/signup" 
              onClick={() => trackEvent('cta_click', { location: 'hero' })}
              className="w-full sm:w-auto px-10 py-5 bg-[#FC6100] text-white text-sm font-black uppercase tracking-[0.2em] rounded-lg hover:bg-[#E35205] transition-all tactile-press border border-white/10 flex items-center justify-center gap-2"
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white text-sm font-black uppercase tracking-[0.2em] rounded-lg hover:bg-white/10 transition-all tactile-press flex items-center justify-center"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Intelligence Core - Visual Demo */}
      <section className="py-64 px-6 relative overflow-hidden flex flex-col items-center bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center space-y-20 flex flex-col items-center relative z-10">
          <div className="space-y-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-full mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Intelligence Core (Live Now)</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight text-center">
              Know your fit.<br />
              Before you <span className="text-[#FC6100] italic">Apply.</span>
            </h2>
            <p className="text-2xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto text-center">
              Udyog Marg analyzes the delta between your resume and the job description in real-time. Get a precision match score, identify missing keywords, and engineer your application for the win.
            </p>
          </div>

          <div className="relative group w-full max-w-2xl mx-auto py-10">
            <div className="absolute inset-0 bg-[#FC6100]/10 blur-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img 
              src="/landing/match_intelligence_demo.png" 
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
                Personalized prep guides, "Trap" question strategies, and AI-drafted elevator pitches tailored to your specific resume delta.
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
              <div className="w-12 h-12 bg-[#FC6100] rounded-xl flex items-center justify-center shadow-lg shadow-[#FC6100]/20">
                <Layers className="text-white w-7 h-7" />
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
