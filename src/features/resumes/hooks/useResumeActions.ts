import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../services/resumeService';
import { RESUMES_QUERY_KEY } from './useResumes';

export function useResumeActions() {
  const queryClient = useQueryClient();

  const createResumeMutation = useMutation({
    mutationFn: ({ name, targetRole }: { name: string; targetRole?: string }) =>
      resumeService.createResume(name, targetRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (id: string) => resumeService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    },
  });

  const createResumeWithFileMutation = useMutation({
    mutationFn: ({ name, file, targetRole }: { name: string; file: File; targetRole?: string }) =>
      resumeService.createResumeWithFile(name, file, targetRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    },
  });

  return {
    createResume: createResumeMutation.mutateAsync,
    createResumeWithFile: createResumeWithFileMutation.mutateAsync,
    isCreating: createResumeMutation.isPending || createResumeWithFileMutation.isPending,
    createError: createResumeMutation.error || createResumeWithFileMutation.error,

    deleteResume: deleteResumeMutation.mutateAsync,
    isDeleting: deleteResumeMutation.isPending,
    deleteError: deleteResumeMutation.error,
  };
}
