import React, { useState } from 'react';
import { useDiscovery } from '../hooks/useDiscovery';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { Search, Briefcase, Loader2, AlertCircle, ChevronDown } from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [query, setQuery] = useState(() => localStorage.getItem('discovery_q') || '');
  const [location, setLocation] = useState(() => localStorage.getItem('discovery_loc') || 'Worldwide');
  const [daysAgo, setDaysAgo] = useState(() => Number(localStorage.getItem('discovery_days')) || 7);
  
  const [searchTrigger, setSearchTrigger] = useState({ 
    query: localStorage.getItem('discovery_active_q') || '', 
    location: localStorage.getItem('discovery_active_loc') || 'Worldwide', 
    daysAgo: Number(localStorage.getItem('discovery_active_days')) || 7 
  });

  const { data: results, isLoading, error, isFetching } = useDiscovery(
    searchTrigger.query,
    searchTrigger.location,
    searchTrigger.daysAgo
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearchTrigger({ query, location, daysAgo });
    
    // Persist
    localStorage.setItem('discovery_q', query);
    localStorage.setItem('discovery_loc', location);
    localStorage.setItem('discovery_days', daysAgo.toString());
    localStorage.setItem('discovery_active_q', query);
    localStorage.setItem('discovery_active_loc', location);
    localStorage.setItem('discovery_active_days', daysAgo.toString());
  };

  return (
    <div className="max-w-7xl space-y-16 fade-in-up">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-8 h-[2px] bg-[#FC6100]"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Market Discovery</span>
        </div>
        <h1 className="text-5xl font-bold text-white flex items-center gap-4 tracking-tighter leading-none">
          Smart Discovery
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl font-medium">
          Source the freshest jobs directly from LinkedIn & Indeed. No more "30+ days ago" ghosts.
        </p>
      </div>

      {/* Search Bar */}
      <div className="clean-card p-6 md:p-8 bg-[#121212]/80 backdrop-blur-md sticky top-2 z-20 shadow-2xl border-white/5">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Keywords</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Title or Skills"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#FC6100] outline-none transition-all placeholder-gray-600 font-bold"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Location</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="City or Remote"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#FC6100] outline-none transition-all placeholder-gray-600 font-bold"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-56 space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Freshness</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#FC6100] outline-none transition-all font-bold appearance-none cursor-pointer pr-12"
                value={daysAgo}
                onChange={(e) => setDaysAgo(Number(e.target.value))}
              >
                <option value={1} className="bg-[#121212]">Past 24 Hours</option>
                <option value={3} className="bg-[#121212]">Past 3 Days</option>
                <option value={7} className="bg-[#121212]">Past Week</option>
                <option value={14} className="bg-[#121212]">Past 14 Days</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isLoading || isFetching || !query.trim()}
            className="px-10 py-4 h-[60px] bg-gradient-to-r from-[#FC6100] to-[#FF8C00] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-[#FC6100]/20 border border-white/10 whitespace-nowrap min-w-fit"
          >
            {(isLoading || isFetching) ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Find Jobs
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-8">
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="clean-card h-64 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="clean-card p-12 text-center space-y-4 border-red-500/20 bg-red-500/5">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">Scraping Failed</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Apify encountered an error or you ran out of credits. Check your API token or try again later.
            </p>
          </div>
        ) : results?.length === 0 ? (
          <div className="clean-card p-24 text-center space-y-6 border-dashed border-white/10">
            <Briefcase className="w-16 h-16 text-gray-700 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {!searchTrigger.query ? "Ready to find your next role?" : "No fresh jobs found"}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {!searchTrigger.query 
                  ? "Enter a title and location above to pull the freshest roles from across the web." 
                  : `We couldn't find any fresh "${searchTrigger.query}" roles in "${searchTrigger.location}" from the past ${searchTrigger.daysAgo} days.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results?.map((job) => (
              <DiscoveryCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
