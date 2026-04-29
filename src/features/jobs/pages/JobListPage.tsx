import React, { useState, useMemo } from 'react';
import { useJobs } from '../hooks/useJobs';
import { useJobActions } from '../hooks/useJobActions';
import { JobCard } from '../components/JobCard';
import { AddJobModal } from '../components/AddJobModal';
import { Plus, Search } from 'lucide-react';

export const JobListPage: React.FC = () => {
  const { data: jobs, isLoading } = useJobs();
  const { createJob, isCreating } = useJobActions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState('all');

  const handleCreate = async (data: any) => {
    await createJob(data);
    setIsModalOpen(false);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-[#FC6100] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold">Synchronizing Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Job Pipeline</h1>
          <p className="text-gray-400 font-medium">Organize and track your active applications.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search applications..."
              className="pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-[#FC6100] focus:ring-1 focus:ring-[#FC6100] outline-none transition-all w-64 shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-[#FC6100] text-white text-sm font-bold rounded-lg hover:bg-[#E35205] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
        {['saved', 'applied', 'interviewing', 'offered', 'rejected'].map(status => (
          <div key={status} className="min-w-[320px] w-[320px] flex flex-col gap-4">
            <div className="bg-white/5 border-b-4 border-[#FC6100] p-4 rounded-t-xl">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#FC6100] uppercase tracking-wider capitalize">{status}</h3>
                  <span className="bg-[#FC6100]/20 text-[#FC6100] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#FC6100]/30">
                    {groupedJobs[status]?.length || 0}
                  </span>
               </div>
            </div>

            <div className="space-y-4 flex-1 min-h-[500px]">
               {groupedJobs[status]?.length === 0 ? (
                 <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center bg-white/2">
                    <p className="text-[10px] font-bold text-gray-600 uppercase">No Items</p>
                 </div>
               ) : (
                 groupedJobs[status]?.map(job => (
                   <JobCard key={job.id} job={job} />
                 ))
               )}
            </div>
          </div>
        ))}
      </div>

      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />
    </div>
  );
};