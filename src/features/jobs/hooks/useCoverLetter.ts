import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coverLetterService } from '../services/coverLetterService';

export const useCoverLetter = (applicationId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['cover-letter', applicationId],
    queryFn: () => {
      if (!applicationId) throw new Error('Application ID required');
      return coverLetterService.getCoverLetterForApplication(applicationId);
    },
    enabled: !!applicationId,
  });

  const saveMutation = useMutation({
    mutationFn: (content: string) => {
      if (!applicationId) throw new Error('Application ID required');
      return coverLetterService.saveCoverLetter(applicationId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cover-letter', applicationId] });
    },
  });

  return {
    coverLetter: query.data,
    isLoading: query.isLoading,
    error: query.error,
    saveCoverLetter: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
