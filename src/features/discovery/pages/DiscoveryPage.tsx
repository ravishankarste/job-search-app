import React, { useState } from 'react';
import { Compass, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useDiscovery } from '../hooks/useDiscovery';
import { DiscoveryCard } from '../components/DiscoveryCard';

export const DiscoveryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Remote');
  const [daysAgo, setDaysAgo] = useState(7);
  const [activeSearch, setActiveSearch] = useState({ query: '', location: '', daysAgo: 7 });

  const { data: jobs, isLoading, error, isRefetching } = useDiscovery(
    activeSearch.query, 
    activeSearch.location, 
    activeSearch.daysAgo
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveSearch({ query, location, daysAgo });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 fade-in-up pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-[2px] bg-[#FC6100]"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Market Intelligence</span>
             <span className="px-2 py-0.5 bg-[#FC6100]/10 border border-[#FC6100]/20 rounded text-[8px] font-black text-[#FC6100] uppercase tracking-widest animate-pulse">
               Live: May 16 Deployment
             </span>
          </div>
          <h1 className="text-6xl font-bold text-white tracking-tighter leading-none">
            Job <span className="text-[#FC6100] italic">Discovery</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl font-medium">
            Scan the entire market in seconds. We appreciate our global audience's patience during this 24h architectural rollout.
          </p>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">System Status</span>
            <span className="text-[9px] font-bold text-emerald-500/80 uppercase">All Nodes Active</span>
          </div>
        </div>
      </div>

      {/* Search Command Center */}
      <section className="relative group">
        <div className="absolute inset-0 bg-[#FC6100]/5 blur-3xl rounded-[40px] transition-all duration-1000 group-hover:bg-[#FC6100]/10"></div>
        <form onSubmit={handleSearch} className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-black/60 border border-white/10 rounded-[32px] backdrop-blur-xl shadow-2xl">
          <div className="relative group/input flex-grow md:col-span-1.5">
            <input 
              type="text"
              placeholder="Job Title or Keywords..."
              className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder-gray-700 focus:bg-black/60 focus:border-[#FC6100]/30 outline-none transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="relative group/input md:col-span-1">
            <input 
              type="text"
              placeholder="Location (e.g. Remote)..."
              className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder-gray-700 focus:bg-black/60 focus:border-[#FC6100]/30 outline-none transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="relative group/input md:col-span-1">
            <select 
              className="w-full px-6 pr-10 py-5 bg-black/40 border border-white/5 rounded-2xl text-sm font-bold text-white appearance-none focus:bg-black/60 focus:border-[#FC6100]/30 outline-none transition-all cursor-pointer"
              value={daysAgo}
              onChange={(e) => setDaysAgo(Number(e.target.value))}
            >
              <option value={1} className="bg-[#121212]">Last 24 Hours</option>
              <option value={3} className="bg-[#121212]">Last 3 Days</option>
              <option value={7} className="bg-[#121212]">Last 7 Days</option>
              <option value={14} className="bg-[#121212]">Last 14 Days</option>
              <option value={30} className="bg-[#121212]">Last 30 Days</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={isLoading || isRefetching}
            className="md:col-span-0.5 w-full bg-[#FC6100] hover:bg-[#E35205] disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-[#FC6100]/20 active:scale-95"
          >
            {isLoading || isRefetching ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-3 px-4 py-5">
                <Compass className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Discover</span>
              </div>
            )}
          </button>
        </form>
      </section>

      {/* Results Display */}
      <div className="space-y-10 min-h-[400px]">
        {isLoading || isRefetching ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center animate-pulse">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-4">
              <Compass className="w-10 h-10 text-[#FC6100] animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Scanning Market Nodes...</h3>
              <p className="text-sm text-gray-500 font-medium">Extracting live data from LinkedIn and Indeed. This usually takes 10-15 seconds.</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
             <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
               <AlertCircle className="w-8 h-8 text-red-500" />
             </div>
             <div className="space-y-2">
               <h3 className="text-xl font-bold text-white tracking-tight uppercase">Discovery Interrupted</h3>
               <p className="text-sm text-gray-500 font-medium max-w-md mx-auto">{(error as any).message || "An unexpected error occurred while scanning the market."}</p>
             </div>
             <button 
              onClick={() => setActiveSearch({ ...activeSearch })}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
             >
               Attempt Re-connection
             </button>
          </div>
        ) : !activeSearch.query ? (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-8">
            <div className="relative">
               <div className="absolute inset-0 bg-[#FC6100]/20 blur-3xl rounded-full"></div>
               <Sparkles className="w-16 h-16 text-[#FC6100] relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tighter italic uppercase">Intelligence Ready</h3>
              <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto uppercase tracking-widest">Enter a role title and location to begin your market scan.</p>
            </div>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700">
            {jobs.map((job) => (
              <DiscoveryCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <h3 className="text-xl font-bold text-white">No Results Found</h3>
            <p className="text-sm text-gray-500 font-medium">Try broadening your search or checking a longer timeframe.</p>
          </div>
        )}
      </div>
    </div>
  );
};
