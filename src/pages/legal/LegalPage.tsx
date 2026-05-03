import React, { useEffect } from 'react';
import { Shield, FileText, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LegalPage: React.FC = () => {
  useEffect(() => {
    // Handle hash scrolling
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-[#FC6100]/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FC6100]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FC6100]/5 blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full flex flex-col items-center">
        {/* Header and Hero Zone */}
        <div className="w-full max-w-7xl mx-auto pt-32 pb-48 px-6 flex flex-col items-center gap-20">
          <Link to="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#FC6100]" /> 
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white transition-colors">Back to Home</span>
          </Link>
          
          <div className="space-y-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-full mx-auto text-center">
               <Shield className="w-3 h-3 text-[#FC6100]" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC6100]">Alpha Transparency Protocol</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-center leading-tight text-white">Legal & Security</h1>
            <p className="text-2xl text-gray-400 font-medium max-w-2xl mx-auto text-center leading-relaxed">
              Udyog Marg is built on trust, transparency, and high-performance security. 
              We are currently in Private Alpha as we finalize our full regulatory framework.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-32 px-6">
          {/* Privacy */}
          <section id="privacy" className="w-full p-16 md:p-24 bg-white/[0.02] border border-white/10 rounded-[64px] space-y-12 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-8 text-[#FC6100]">
              <div className="w-24 h-24 bg-[#FC6100]/10 rounded-3xl flex items-center justify-center shadow-2xl shadow-[#FC6100]/10">
                <Lock className="w-12 h-12" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: '#FC6100' }}>Privacy Policy</h2>
            </div>
            <div className="space-y-8 text-gray-400 leading-loose font-medium max-w-2xl mx-auto text-xl text-center">
              <p>
                Your data is your leverage. Udyog Marg does not sell your job search history, resumes, or personal information to third-party recruiters or advertisers. 
              </p>
              <p>
                During the Alpha phase, we collect essential telemetry to improve the "Match Intelligence" engine. All resume data processed is encrypted at rest and in transit.
              </p>
              <div className="pt-12 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Last Updated</p>
                <p className="text-sm font-bold text-[#FC6100]">May 2, 2026</p>
              </div>
            </div>
          </section>

          {/* Terms */}
          <section id="terms" className="w-full p-16 md:p-24 bg-white/[0.02] border border-white/10 rounded-[64px] space-y-12 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-8 text-[#FC6100]">
              <div className="w-24 h-24 bg-[#FC6100]/10 rounded-3xl flex items-center justify-center shadow-2xl shadow-[#FC6100]/10">
                <FileText className="w-12 h-12" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: '#FC6100' }}>Terms of Service</h2>
            </div>
            <div className="space-y-8 text-gray-400 leading-loose font-medium max-w-2xl mx-auto text-xl">
              <p>
                Udyog Marg is a high-performance tool for career engineering. By using the Alpha, you agree to use our automated scraping and match intelligence features responsibly.
              </p>
              <p>
                As an Alpha user, you acknowledge that features (like the Universal Importer) are under active development and may be subject to API limits or maintenance windows.
              </p>
              <div className="pt-12 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Protocol Version</p>
                <p className="text-sm font-bold text-[#FC6100]">Alpha v1.0 Agreement</p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section id="security" className="w-full p-16 md:p-24 bg-white/[0.02] border border-white/10 rounded-[64px] space-y-12 flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-8 text-[#FC6100]">
              <div className="w-24 h-24 bg-[#FC6100]/10 rounded-3xl flex items-center justify-center shadow-2xl shadow-[#FC6100]/10">
                <Shield className="w-12 h-12" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: '#FC6100' }}>Security Audit</h2>
            </div>
            <div className="space-y-8 text-gray-400 leading-loose font-medium max-w-2xl mx-auto text-xl">
              <p>
                We are currently undergoing a comprehensive security audit to ensure our "Job Search OS" meets enterprise-grade standards. 
              </p>
              <p>
                Our infrastructure is built on Supabase (PostgreSQL) with Row Level Security (RLS) enforced across all tables. Full audit results will be published on May 16th, 2026.
              </p>
              <div className="pt-12 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Current Status</p>
                <p className="text-sm font-bold text-[#FC6100]">In Progress (Target: May 16)</p>
              </div>
            </div>
          </section>
        </div>

        {/* CTA and Final Return */}
        <div className="pt-32 pb-48 text-center border-t border-white/5 w-full max-w-4xl flex flex-col items-center space-y-32">
          <div className="space-y-16 flex flex-col items-center">
            <div className="space-y-6">
              <p className="text-2xl text-gray-500 font-medium">Have questions about our Alpha protocol?</p>
              <p className="text-sm text-gray-600 font-medium tracking-wide uppercase tracking-[0.2em]">Our engineering team is ready to assist.</p>
            </div>
            <a 
              href="mailto:hopeitmadesense@gmail.com" 
              className="px-16 py-8 bg-white/5 border border-white/10 text-white text-sm font-black uppercase tracking-[0.3em] rounded-[32px] hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-black/40"
            >
              Contact Engineering Support
            </a>
          </div>

          <div className="space-y-16 flex flex-col items-center pt-32 w-full border-t border-white/5">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Ready to return?</h2>
              <p className="text-xl text-gray-500 font-medium">Your job search engine is waiting.</p>
            </div>
            <Link 
              to="/" 
              className="px-20 py-10 bg-[#FC6100] text-white text-xl font-black uppercase tracking-[0.4em] rounded-[40px] hover:scale-105 transition-all shadow-[0_40px_100px_rgba(252,97,0,0.5)] flex items-center justify-center gap-6 group"
            >
              <ArrowLeft className="w-8 h-8 group-hover:-translate-x-3 transition-transform" /> 
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Copy */}
      <footer className="py-20 px-6 border-t border-white/5 text-center w-full bg-black">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
          Udyog Marg &copy; 2026. Built in London.
        </p>
      </footer>
    </div>
  );
};
