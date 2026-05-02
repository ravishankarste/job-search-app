import { useMemo } from 'react';
import { useJobs } from './useJobs';
import { useUpcomingTasks } from './useFollowups';

export interface ActionTask {
  id: string;
  type: string;
  notes: string;
  scheduled_at: string;
  isCompleted: boolean;
  isGhost: boolean;
  job?: any;
  application_id?: string;
}

export function useActionPlan() {
  const { data: jobs, isLoading: isJobsLoading } = useJobs();
  const { tasks, toggleFollowup, isLoading: isTasksLoading } = useUpcomingTasks();

  const actionPlan = useMemo(() => {
    if (!jobs) return tasks.map(t => ({ ...t, isGhost: false }));

    // 1. Get existing manual tasks
    const manualTasks: ActionTask[] = tasks.map(t => ({ 
      ...t, 
      isGhost: false,
      job: t.application?.job // flatten for easier access
    }));

    // 2. Find ghosted jobs that DON'T have an upcoming manual task
    const ghostedTasks: ActionTask[] = jobs
      .filter(job => {
        if (!job.application) return false;
        const status = job.application.status;
        if (status !== 'applied' && status !== 'interviewing') return false;

        const dateString = job.application.updated_at || job.application.created_at;
        if (!dateString) return false;
        const updatedDate = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return diffDays > 14;
      })
      .filter(job => {
        // Check if there's already a manual task for this job
        return !tasks.some(t => t.application_id === job.application?.id);
      })
      .map(job => ({
        id: `ghost-${job.id}`,
        type: 'Ghost Check',
        notes: `Follow up with ${job.company_name} (Stale Application)`,
        scheduled_at: job.application?.updated_at || job.application?.created_at || new Date().toISOString(),
        isCompleted: false,
        isGhost: true,
        job: job,
        application_id: job.application?.id
      }));

    return [...manualTasks, ...ghostedTasks].sort((a, b) => 
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  }, [jobs, tasks]);

  return {
    tasks: actionPlan,
    isLoading: isJobsLoading || isTasksLoading,
    toggleFollowup
  };
}
