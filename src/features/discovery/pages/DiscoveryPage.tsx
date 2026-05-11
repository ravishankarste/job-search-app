import React from 'react';
import { Compass } from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-16 fade-in-up pb-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-8 h-[2px] bg-[#FC6100]"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Market Discovery</span>
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tighter leading-none">
          Smart Discovery
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl font-medium">
          The industry's most advanced job sourcing engine, undergoing a massive architectural evolution.
        </p>
      </div>

      {/* Trendy Coming Soon / Evolving State */}
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-10 text-center px-6 relative overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.01]">
        {/* Animated Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FC6100]/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-[#FC6100]/20 blur-3xl rounded-full group-hover:bg-[#FC6100]/30 transition-all animate-pulse"></div>
          <div className="relative w-24 h-24 bg-black border border-white/10 rounded-[32px] flex items-center justify-center shadow-2xl backdrop-blur-xl transition-transform group-hover:scale-110 duration-500">
            <Compass className="w-10 h-10 text-[#FC6100] animate-spin-slow" />
          </div>
        </div>

        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FC6100] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FC6100]"></span>
            </span>
            <span className="text-[10px] font-black text-[#FC6100] uppercase tracking-[0.2em]">Next-Gen Intelligence</span>
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
            The Engine is <br />
            <span className="text-[#FC6100]">Evolving</span>
          </h2>
          
          <p className="text-gray-500 font-medium text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            We're upgrading our hyper-discovery algorithms to bring you deeper, faster, and more exclusive job insights. 
          </p>
        </div>

        <div className="pt-8 flex flex-col items-center gap-4 relative z-10">
          <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">Expected Deployment</div>
          <div className="flex gap-4">
            <div className="clean-card px-8 py-5 bg-white/[0.03] border-white/10 shadow-2xl">
              <span className="text-4xl font-black text-white italic tracking-tighter">MAY 16,</span>
              <span className="ml-2 text-sm font-black text-[#FC6100] uppercase">2026</span>
            </div>
          </div>
        </div>
        
        <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] pt-12 relative z-10">
          Use the <span className="text-white">Universal Importer</span> to track roles in the meantime.
        </p>
      </div>
    </div>
  );
};
