import React from 'react';
import { ExternalLink, Building2, MapPin, Clock, Plus, CheckCircle2 } from 'lucide-react';
import type { DiscoveredJob } from '../services/apifyService';
import { useJobActions } from '../../jobs/hooks/useJobActions';

interface DiscoveryCardProps {
  job: DiscoveredJob;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ job }) => {
  const { createJob, isCreating } = useJobActions();
  const [isAdded, setIsAdded] = React.useState(false);

  const handleAdd = async () => {
    try {
      await createJob({
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        url: job.url,
        description: job.description,
        employment_type: 'full-time', // Default, user can change later
      });
      setIsAdded(true);
    } catch (error) {
      console.error('Failed to add job to pipeline', error);
    }
  };

  // eslint-disable-next-line react-hooks/purity
  const now = React.useMemo(() => Date.now(), []);

  const getTimeAgo = (dateStr: string) => {
    const diffHours = Math.round((now - new Date(dateStr).getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.round(diffHours / 24)} days ago`;
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 hover:-translate-y-1 hover:border-[#FC6100]/50 transition-all duration-300 group shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-[#FC6100] transition-colors">{job.title}</h3>
          <div className="flex items-center text-gray-400 font-bold mt-1">
            <Building2 className="w-4 h-4 mr-2 opacity-60" />
            {job.company_name}
          </div>
        </div>
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
          title={`View on ${job.source}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="flex gap-4 mb-5 text-xs font-bold text-gray-500 tracking-wider uppercase">
        <span className="flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1 text-[#FC6100]/60" /> {job.location}
        </span>
        <span className="flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1 text-[#FC6100]/60" /> {getTimeAgo(job.posted_at)}
        </span>
      </div>

      <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
        {job.description}
      </p>

      <div className="pt-4 border-t border-white/5">
        {isAdded ? (
          <button disabled className="w-full py-3 flex justify-center items-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-sm transition-all">
            <CheckCircle2 className="w-4 h-4 mr-2" /> In Pipeline
          </button>
        ) : (
          <button 
            onClick={handleAdd}
            disabled={isCreating}
            className="w-full py-3 flex justify-center items-center rounded-xl bg-[#FC6100]/10 text-[#FC6100] hover:bg-[#FC6100] hover:text-white font-bold text-sm transition-all disabled:opacity-50"
          >
            {isCreating ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add to Pipeline</>}
          </button>
        )}
      </div>
    </div>
  );
};
