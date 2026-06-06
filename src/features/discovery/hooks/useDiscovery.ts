import { useQuery } from '@tanstack/react-query';
import { jobRelevanceService } from '../services/jobRelevanceService';

export const useDiscovery = (query: string, country: string, daysAgo: number) => {
  return useQuery({
    queryKey: ['discovery', query, country, daysAgo],
    queryFn: () => jobRelevanceService.searchJobs(query, country),
    enabled: !!query, // Only run if there's a query
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });
};
