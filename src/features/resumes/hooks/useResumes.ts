import { useQuery } from '@tanstack/react-query';
import { resumeService } from '../services/resumeService';

export const RESUMES_QUERY_KEY = ['resumes'];

export function useResumes() {
  return useQuery({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: () => resumeService.getUserResumes(),
  });
}
