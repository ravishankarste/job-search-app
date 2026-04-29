import { useQuery } from '@tanstack/react-query';
import { apifyService } from '../services/apifyService';

export const useDiscovery = (query: string, location: string, daysAgo: number) => {
  return useQuery({
    queryKey: ['discovery', query, location, daysAgo],
    queryFn: () => apifyService.searchJobs(query, location, daysAgo),
    enabled: !!query, // Only run if there's a query
    staleTime: 1000 * 60 * 5, // Cache for 5 mins so we don't re-scrape unnecessarily
  });
};
