import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { JOB_DETAIL_QUERY_KEY } from './useJobActions';

export function useJobDetail(id: string) {
  return useQuery({
    queryKey: JOB_DETAIL_QUERY_KEY(id),
    queryFn: () => jobService.getJobById(id),
    enabled: !!id,
  });
}
