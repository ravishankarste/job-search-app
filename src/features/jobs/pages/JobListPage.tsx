import React, { useState, useMemo } from 'react';
import { useJobs } from '../hooks/useJobs';
import { useJobActions } from '../hooks/useJobActions';
import { JobCard } from '../components/JobCard';
import { AddJobModal } from '../components/AddJobModal';
import { FollowUpModal } from '../components/FollowUpModal';
import { Plus, Search, ArrowRight } from 'lucide-react';
import { UniversalImporter } from '../components/UniversalImporter';
import { OnboardingAccelerator } from '../../../components/onboarding/OnboardingAccelerator';

export const JobListPage: React.FC = () => {
  const { data: jobs, isPending, isError, error, refetch } = useJobs();
  const { createJob, isCreating } = useJobActions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState('all');
  const [followUpData, setFollowUpData] = useState<{ title: string; company: string } | null>(null);
  const [prefilledData, setPrefilledData] = useState<any>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);
  const importerRef = React.useRef<HTMLDivElement>(null);

  const handleCreate = async (data: any) => {
    await createJob(data);
    setIsModalOpen(false);
    setPrefilledData(null);
  };

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch =
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || job.application?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const groupedJobs = useMemo(() => {
    const map: Record<string, any[]> = {
      saved: [],
      applied: [],
      interviewing: [],
      offered: [],
      rejected: [],
    };

    filteredJobs?.forEach(job => {
      const status = job.application?.status || 'saved';
      if (map[status]) map[status].push(job);
    });

    return map;
  }, [filteredJobs]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-[#FC6100] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold">Synchronizing Pipeline...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <Search className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Sync Failure</h2>
          <p className="text-sm text-gray-500 max-w-sm">We couldn't reach your pipeline. This might be a temporary network issue.</p>
          <p className="text-[10px] text-red-500/50 font-mono mt-2">Error: {error?.message || 'Unknown Protocol Error'}</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-lg border border-white/10 transition-all tactile-press"
        >
          Force Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-12 fade-in-up">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-[2px] bg-[#FC6100]"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC6100]">Application Workflow</span>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tighter">Job Pipeline</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by title or company..."
              className="pl-4 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-white/40 focus:border-[#FC6100] outline-none transition-all w-64 font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 bg-[#FC6100] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#E35205] transition-all flex items-center gap-2 border border-white/10 tactile-press"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Universal Importer */}
      <div ref={importerRef}>
        <UniversalImporter 
          onImportSuccess={(data) => {
            setPrefilledData(data);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* Status Quick Navigator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['saved', 'applied', 'interviewing', 'offered', 'rejected'].map(status => {
          const count = groupedJobs[status]?.length || 0;
          const isRejected = status === 'rejected';
          
          return (
            <button 
              key={status}
              onClick={() => {
                const column = document.getElementById(`column-${status}`);
                if (column && boardRef.current) {
                  const board = boardRef.current;
                  const targetScroll = column.offsetLeft - board.offsetLeft - 0;
                  board.scrollTo({ left: targetScroll, behavior: 'smooth' });
                }
              }}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all group shrink-0 tactile-press ${
                isRejected 
                  ? 'bg-red-500/10 border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/20' 
                  : 'bg-[#1A1A1A] border border-white/10 hover:border-[#FC6100]/50'
              }`}
            >
              {isRejected && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                isRejected ? 'text-white group-hover:text-red-200' : 'text-gray-500 group-hover:text-white'
              }`}>
                {status}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                count > 0 
                  ? (isRejected ? 'bg-red-500 text-white' : 'bg-[#FC6100] text-white') 
                  : 'bg-white/10 text-gray-600'
              }`}>
                {count}
              </span>
              {isRejected && (
                <ArrowRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          );
        })}
      </div>

      {/* Kanban Board or Accelerator */}
      {jobs && jobs.length > 0 ? (
        <div 
          ref={boardRef}
          className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar relative"
        >
          {['saved', 'applied', 'interviewing', 'offered', 'rejected'].map(status => {
            const isRejected = status === 'rejected';
            return (
              <div key={status} id={`column-${status}`} className="min-w-[320px] w-[320px] flex flex-col gap-4">
                <div className={`p-4 rounded-t-xl border-b-4 ${
                  isRejected ? 'bg-red-500/10 border-red-500 rejected-glow' : 'bg-[#1A1A1A] border-[#FC6100]'
                }`}>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isRejected && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                        <h3 className={`text-sm font-bold uppercase tracking-wider capitalize ${
                          isRejected ? 'text-white' : 'text-[#FC6100]'
                        }`}>
                          {status}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isRejected 
                          ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                          : 'bg-[#FC6100]/20 text-[#FC6100] border-[#FC6100]/30'
                      }`}>
                        {groupedJobs[status]?.length || 0}
                      </span>
                   </div>
                </div>

                <div className="space-y-4 flex-1 min-h-[500px]">
                   {groupedJobs[status]?.length === 0 ? (
                     <div className="h-32 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center bg-white/[0.01] transition-colors hover:bg-white/[0.03] p-6 text-center">
                        <Search className="w-6 h-6 text-gray-700 mb-2 opacity-50" />
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Applications</p>
                        <p className="text-[9px] text-gray-700 font-medium mt-1">Ready for a new role?</p>
                     </div>
                   ) : (
                     groupedJobs[status]?.map(job => (
                       <JobCard 
                         key={job.id} 
                         job={job} 
                         onFollowUpClick={(company) => setFollowUpData({ title: job.title, company })} 
                       />
                     ))
                   )}
                </div>
              </div>
            );
          })}
          
          {/* End of Pipeline Indicator */}
          <div className="min-w-[100px] flex items-center justify-center opacity-20 hover:opacity-100 transition-opacity pr-12">
             <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-red-500/30 flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-red-500/50" />
                </div>
                <span className="text-[8px] font-black text-red-500/40 uppercase tracking-[0.2em] [writing-mode:vertical-lr]">End of Pipeline</span>
             </div>
          </div>
        </div>
      ) : (
        <OnboardingAccelerator 
          onManualClick={() => setIsModalOpen(true)}
          onImportClick={() => {
            importerRef.current?.scrollIntoView({ behavior: 'smooth' });
            importerRef.current?.querySelector('input')?.focus();
          }}
        />
      )}

      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefilledData(null);
        }}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        initialData={prefilledData}
      />

      <FollowUpModal
        isOpen={!!followUpData}
        onClose={() => setFollowUpData(null)}
        companyName={followUpData?.company || ''}
        jobTitle={followUpData?.title || ''}
      />
    </div>
  );
};