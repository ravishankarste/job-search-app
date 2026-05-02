import { useMemo } from 'react';
import { useJobs } from '../../jobs/hooks/useJobs';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

export function useAnalytics() {
  const { data: jobs = [], isLoading } = useJobs();

  const stats = useMemo(() => {
    if (!jobs.length) return null;

    // 1. Status Distribution
    const statusCounts: Record<string, number> = {};
    jobs.forEach(job => {
      const status = job.application?.status || 'saved';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // 2. Timeline Data (Last 14 Days)
    const last14Days = eachDayOfInterval({
      start: startOfDay(subDays(new Date(), 13)),
      end: startOfDay(new Date())
    });

    const timelineData = last14Days.map((day: Date) => {
      const dayStr = format(day, 'MMM dd');
      const count = jobs.filter(job => {
        if (!job.created_at) return false;
        const jobDate = startOfDay(new Date(job.created_at));
        return jobDate.getTime() === day.getTime();
      }).length;

      return {
        date: dayStr,
        applications: count
      };
    });

    // 3. High Level Metrics
    const total = jobs.length;
    const interviewing = statusCounts['interviewing'] || 0;
    const applied = (statusCounts['applied'] || 0) + interviewing + (statusCounts['rejected'] || 0) + (statusCounts['offer'] || 0);
    const successRate = total > 0 ? Math.round(((interviewing + (statusCounts['offer'] || 0)) / total) * 100) : 0;

    return {
      statusCounts,
      timelineData,
      metrics: {
        total,
        applied,
        interviewing,
        successRate
      }
    };
  }, [jobs]);

  return {
    stats,
    isLoading
  };
}
