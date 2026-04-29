import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupService } from '../services/followupService';
import type { FollowupInsert } from '../services/followupService';

export const useFollowups = (applicationId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['followups', applicationId],
    queryFn: () => {
      if (!applicationId) throw new Error('Application ID is required');
      return followupService.getFollowupsByApplication(applicationId);
    },
    enabled: !!applicationId,
  });

  const createMutation = useMutation({
    mutationFn: (data: FollowupInsert) => followupService.createFollowup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups', applicationId] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) => 
      followupService.toggleFollowupCompletion(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups', applicationId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => followupService.deleteFollowup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups', applicationId] });
    },
  });

  return {
    followups: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createFollowup: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    toggleFollowup: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
    deleteFollowup: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useUpcomingTasks = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['upcoming-tasks'],
    queryFn: () => followupService.getUpcomingTasks(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) => 
      followupService.toggleFollowupCompletion(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-tasks'] });
      // Also invalidate general followups so JobDetail view stays in sync
      queryClient.invalidateQueries({ queryKey: ['followups'] });
    },
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    toggleFollowup: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
  };
};
