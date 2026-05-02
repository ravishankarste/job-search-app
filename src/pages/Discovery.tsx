import React, { useState } from 'react';
import { useDiscovery } from '../features/discovery/hooks/useDiscovery';
import { DiscoveryCard } from '../features/discovery/components/DiscoveryCard';
import { Search, AlertCircle, ChevronDown } from 'lucide-react';

export const Discovery: React.FC = () => {
  const [queryInput, setQueryInput] = useState(() => localStorage.getItem('discovery_q') || 'React Developer');
  const [locationInput, setLocationInput] = useState(() => localStorage.getItem('discovery_loc') || 'Remote');
  const [daysAgo, setDaysAgo] = useState(() => Number(localStorage.getItem('discovery_days')) || 7);
  
  // The values actually used for the query
  const [activeQuery, setActiveQuery] = useState(() => localStorage.getItem('discovery_active_q') || '');
  const [activeLocation, setActiveLocation] = useState(() => localStorage.getItem('discovery_active_loc') || '');
  const [activeDaysAgo, setActiveDaysAgo] = useState(() => Number(localStorage.getItem('discovery_active_days')) || 7);

  const { data: jobs, isLoading, isFetching, error } = useDiscovery(activeQuery, activeLocation, activeDaysAgo);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(queryInput);
    setActiveLocation(locationInput);
    setActiveDaysAgo(daysAgo);

    // Persist to local storage so results remain when navigating away
    localStorage.setItem('discovery_q', queryInput);
    localStorage.setItem('discovery_loc', locationInput);
    localStorage.setItem('discovery_days', daysAgo.toString());
    localStorage.setItem('discovery_active_q', queryInput);
    localStorage.setItem('discovery_active_loc', locationInput);
    localStorage.setItem('discovery_active_days', daysAgo.toString());
  };

  return (
    <div className="space-y-8 fade-in-up pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Smart Sourcing</h1>
        <p className="text-gray-500 text-sm mt-2">Discover ultra-fresh jobs from LinkedIn and Indeed tailored to your criteria.</p>
      </div>

      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Job Title or Keywords" 
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] transition-all"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Location (e.g. Remote, NY)" 
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] transition-all"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
          </div>
          <div className="md:w-48 relative">
            <select
              className="w-full pl-4 pr-10 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] transition-all appearance-none cursor-pointer"
              value={daysAgo}
              onChange={(e) => setDaysAgo(Number(e.target.value))}
            >
              <option value={1} className="bg-[#1A1A1A]">Past 24 Hours</option>
              <option value={3} className="bg-[#1A1A1A]">Past 3 Days</option>
              <option value={7} className="bg-[#1A1A1A]">Past 7 Days</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
          <button 
            type="submit"
            disabled={isFetching}
            className="px-8 py-4 bg-[#FC6100] text-white font-bold rounded-lg hover:bg-[#E35205] transition-all tactile-press border border-white/10 whitespace-nowrap disabled:opacity-70 disabled:cursor-wait flex items-center justify-center min-w-[140px]"
          >
            {isFetching ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Searching...
              </div>
            ) : (
              'Find Jobs'
            )}
          </button>
        </form>
      </div>

      {activeQuery && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              Matches for "{activeQuery}"
            </h2>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {daysAgo === 1 ? 'Ultra Fresh' : daysAgo === 3 ? 'Fresh' : 'Active'}
            </span>
          </div>

          {isFetching && !isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white/5 border border-white/10 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white/5 border border-white/10 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-400 font-bold mb-2">Failed to load jobs. Please try again.</p>
              <p className="text-red-400/70 text-xs font-mono break-words">{error instanceof Error ? error.message : String(error)}</p>
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <DiscoveryCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-12 text-center">
              <p className="text-gray-500 font-bold">No fresh jobs found matching your criteria.</p>
              <p className="text-gray-600 text-sm mt-2">Try expanding your search or changing the freshness filter.</p>
            </div>
          )}
        </div>
      )}

      {!activeQuery && (
        <div className="bg-[#1A1A1A] border border-white/10 border-dashed rounded-xl p-16 text-center">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">Ready to find your next role?</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            Enter your desired role above. We'll scour the web for ultra-fresh opportunities and you can push them straight into your Kanban board with one click.
          </p>
        </div>
      )}
    </div>
  );
};
