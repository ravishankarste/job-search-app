import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../services/resumeService';
import type { Json } from '../../../types/supabase';

export const getResumeVersionsQueryKey = (resumeId: string) => ['resumeVersions', resumeId];

export function useResumeVersions(resumeId: string) {
  const queryClient = useQueryClient();

  // Fetch versions
  const versionsQuery = useQuery({
    queryKey: getResumeVersionsQueryKey(resumeId),
    queryFn: () => resumeService.getResumeVersions(resumeId),
    enabled: !!resumeId, // Only fetch if resumeId is provided
  });

  // Upload version mutation
  const uploadVersionMutation = useMutation({
    mutationFn: ({
      versionNumber,
      file,
      label,
      content,
    }: {
      versionNumber: number;
      file: File;
      label?: string;
      content?: Json;
    }) => resumeService.createResumeVersion(resumeId, versionNumber, file, label, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getResumeVersionsQueryKey(resumeId) });
    },
  });

  return {
    versions: versionsQuery.data || [],
    isLoadingVersions: versionsQuery.isPending,
    versionsError: versionsQuery.error,

    uploadVersion: uploadVersionMutation.mutateAsync,
    isUploading: uploadVersionMutation.isPending,
    uploadError: uploadVersionMutation.error,
  };
}
