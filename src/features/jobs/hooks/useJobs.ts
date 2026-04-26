import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/jobService';

export const JOBS_QUERY_KEY = ['jobs'];

export function useJobs() {
  return useQuery({
    queryKey: JOBS_QUERY_KEY,
    queryFn: () => jobService.getJobs(),
  });
}
