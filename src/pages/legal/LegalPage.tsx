import React, { useEffect } from 'react';
import { Layers, Shield, FileText, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalPage: React.FC = () => {
  useEffect(() => {
    // Handle hash scrolling if user comes from a specific link
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-[#FC6100]/30">
      {/* Premium Header */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#FC6100] rounded-xl flex items-center justify-center shadow-lg shadow-[#FC6100]/20 group-hover:scale-110 transition-transform">
              <Layers className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Udyog Marg</span>
          </Link>
          <Link to="/" className="text-sm font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-48 pb-32 px-6">
        <div className="space-y-24">
          
          {/* Header Section */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Legal Hub</h1>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
              Engineered for transparency. We protect your data as rigorously as you build your career.
            </p>
          </div>

          {/* Privacy Policy Section */}
          <section id="privacy" className="space-y-12 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4 text-white">
              <Shield className="w-8 h-8 text-[#FC6100]" />
              <h2 className="text-3xl font-bold tracking-tight">Privacy Policy</h2>
            </div>
            
            <div className="space-y-8 text-lg leading-relaxed text-gray-400">
              <p>
                At Udyog Marg, we respect your privacy. This policy outlines how we handle your data within the Alpha phase of our platform.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">1. Data Collection</h3>
                <p>
                  We collect professional information you provide, including resume data, job descriptions, and application statuses, solely to provide match intelligence and tracking services.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">2. Third-Party Services</h3>
                <p>
                  We use Supabase for secure data storage and Google for authentication. Your data is never sold to third parties. We use Apify for public job data extraction only.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">3. Your Rights</h3>
                <p>
                  You have full control over your data. You may delete your account and all associated job tracking data at any time via the dashboard settings.
                </p>
              </div>
            </div>
          </section>

          {/* Terms of Service Section */}
          <section id="terms" className="space-y-12 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4 text-white">
              <FileText className="w-8 h-8 text-[#FC6100]" />
              <h2 className="text-3xl font-bold tracking-tight">Terms of Service</h2>
            </div>

            <div className="space-y-8 text-lg leading-relaxed text-gray-400">
              <p>
                By using Udyog Marg, you agree to the following terms designed to protect the integrity of our Alpha community.
              </p>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">1. Alpha Usage</h3>
                <p>
                  Udyog Marg is currently in an Alpha stage. While we strive for 100% uptime, services are provided "as-is" during this testing phase.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">2. Acceptable Use</h3>
                <p>
                  Users agree not to use the automated discovery tools for any purpose other than personal career advancement. Mass scraping or botting of our internal platform is strictly prohibited.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">3. Intellectual Property</h3>
                <p>
                  The "Udyog Marg" name, logo, and the proprietary Match Intelligence algorithms are the exclusive property of our platform developers.
                </p>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section id="security" className="space-y-12 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4 text-white">
              <Lock className="w-8 h-8 text-[#FC6100]" />
              <h2 className="text-3xl font-bold tracking-tight">Security Standards</h2>
            </div>
            <p className="text-lg leading-relaxed text-gray-400">
              All communications between your browser and our servers are encrypted via SSL. We leverage Supabase's enterprise-grade security protocols to ensure your job hunt remains confidential.
            </p>
          </section>

        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/50 text-center">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-700">
          Udyog Marg &copy; 2026. Build Legacy. Dominate the Hunt.
        </p>
      </footer>
    </div>
  );
};

export default LegalPage;
