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

export const LandingPage: React.FC = () => {
  const { session, isLoading } = useAuth();

  // Smart Redirect: If already logged in, skip the landing page
  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FC6100]/30 selection:text-[#FC6100]">
      {/* Navbar */}
      <nav className="h-24 flex items-center justify-between px-6 md:px-12 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FC6100] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(252,97,0,0.3)]">
            <Layers className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Udyog Marg</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link 
            to="/signup" 
            className="px-6 py-2.5 bg-[#FC6100] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#E35205] transition-all shadow-lg shadow-[#FC6100]/20"
          >
            Join Alpha
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FC6100]/30 blur-[120px] -mr-48 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FC6100]/20 blur-[120px] -ml-48 -mb-24"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="w-2 h-2 bg-[#FC6100] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">The Job Search OS v1.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Stop searching.<br />
            Start <span className="text-[#FC6100] italic">Engineering.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            Udyog Marg is the high-performance execution engine for your career. 
            Automate the boring, master the interview, and dominate your pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-10 py-5 bg-[#FC6100] text-white text-sm font-black uppercase tracking-[0.2em] rounded-[20px] hover:scale-105 transition-all shadow-2xl shadow-[#FC6100]/30 flex items-center justify-center gap-2"
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white text-sm font-black uppercase tracking-[0.2em] rounded-[20px] hover:bg-white/10 transition-all"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6 group">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500">
              <Zap className="w-7 h-7 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Universal Importer</h3>
            <p className="text-gray-500 leading-relaxed font-medium">
              Paste any LinkedIn or Indeed URL. Our engine scrapes the data in seconds, building your pipeline with zero manual entry.
            </p>
          </div>

          <div className="space-y-6 group">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500">
              <Target className="w-7 h-7 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">ATS Match Intelligence</h3>
            <p className="text-gray-500 leading-relaxed font-medium">
              Real-time analysis between your resume and the job description. Know your fit percentage and missing keywords instantly.
            </p>
          </div>

          <div className="space-y-6 group">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FC6100] transition-all duration-500">
              <Cpu className="w-7 h-7 text-[#FC6100] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Interview Prep Mode</h3>
            <p className="text-gray-500 leading-relaxed font-medium">
              Personalized prep guides, "Trap" question strategies, and AI-drafted elevator pitches tailored to your specific resume delta.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-4xl font-bold tracking-tight">Engineered for the 1%.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center justify-center gap-2 font-black text-xl italic tracking-tighter">TECH CRUNCH</div>
             <div className="flex items-center justify-center gap-2 font-black text-xl italic tracking-tighter">PRODUCT HUNT</div>
             <div className="flex items-center justify-center gap-2 font-black text-xl italic tracking-tighter">HACKER NEWS</div>
             <div className="flex items-center justify-center gap-2 font-black text-xl italic tracking-tighter">VERGE</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 bg-[#FC6100] rounded-lg flex items-center justify-center">
                <Layers className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold">Udyog Marg</span>
            </div>
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Build your legacy. Dominate the hunt.</p>
          </div>
          
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Globe className="w-4 h-4 text-[#FC6100]" />
            Deployed in London, UK
          </div>
        </div>
      </footer>
    </div>
  );
};
