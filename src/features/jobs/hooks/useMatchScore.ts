import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useResumes } from '../../resumes/hooks/useResumes';
import { resumeService } from '../../resumes/services/resumeService';
import { matchAnalysisService } from '../services/matchAnalysisService';

export function useMatchScore(
  jobTitle: string, 
  jobDescription: string | null, 
  resumeId?: string | null,
  jobId?: string | null
) {
  // 1. Fetch resumes using the SHARED hook
  const { data: resumes, isLoading: isLoadingResumes } = useResumes();

  const primaryResume = React.useMemo(() => {
    if (!resumes || resumes.length === 0) return null;
    
    // If a specific resumeId is provided, use that
    if (resumeId) {
      return resumes.find(r => r.id === resumeId) || resumes[0];
    }

    // Otherwise, prioritize resumes that have a target_role defined
    return resumes.find(r => !!r.target_role) || resumes[0];
  }, [resumes, resumeId]);

  // 2. Fetch the latest version of that resume
  const { data: latestVersion, isLoading: isLoadingVersion, isFetching: isFetchingVersion } = useQuery({
    queryKey: ['resume-version', primaryResume?.id],
    enabled: !!primaryResume?.id,
    queryFn: () => resumeService.getLatestVersion(primaryResume!.id),
  });

  const combinedJobText = `${jobTitle || ''} ${jobDescription || ''}`.trim();
  const resumeText = (latestVersion?.content as any)?.extractedText || "";
  const fallbackText = `${primaryResume?.target_role || ''} ${primaryResume?.name || ''}`.trim();
  const matchText = resumeText || fallbackText || "Software Engineer";

  // 3. Lane A: Fetch Vector Match Score (Authoritative, stateless and fast)
  const { data: vectorResult, isLoading: isLoadingVector, isFetching: isFetchingVector } = useQuery({
    queryKey: ['vector-match-score', primaryResume?.id, latestVersion?.id, combinedJobText, jobId],
    enabled: !!primaryResume?.id && !!combinedJobText,
    queryFn: () => matchAnalysisService.calculateVectorMatch({
      jobId: jobId || undefined,
      resumeVersionId: latestVersion?.id,
      jobDescription: combinedJobText,
      resumeText: matchText
    }),
    staleTime: 1000 * 60 * 60 * 24, // Cache baseline vectors for 24h
  });

  // 4. Lane B: Lazy Fetch LLM Gap/Skills Enrichment (Asynchronous)
  const { data: enrichmentResult, isLoading: isLoadingEnrichment } = useQuery({
    queryKey: ['match-enrichment-details', primaryResume?.id, latestVersion?.id, combinedJobText, jobId],
    enabled: !!primaryResume?.id && !!combinedJobText && !isLoadingVector,
    queryFn: () => matchAnalysisService.getLLMEnrichment({
      jobId: jobId || undefined,
      resumeVersionId: latestVersion?.id,
      jobDescription: combinedJobText,
      resumeText: matchText
    }),
    staleTime: 1000 * 60 * 10, // Cache AI recommendations for 10 minutes
  });

  return {
    score: vectorResult?.score ?? 0,
    matchingSkills: enrichmentResult?.matchingSkills ?? [],
    missingSkills: enrichmentResult?.missingSkills ?? [],
    warnings: enrichmentResult?.warnings ?? vectorResult?.warnings ?? [],
    weightedDetails: enrichmentResult?.weightedDetails ?? { coreMatches: [], secondaryMatches: [] },
    confidenceMode: enrichmentResult ? 'llm' : (vectorResult?.confidence_mode ?? 'vector'),
    hasResumeText: !!resumeText,
    isLoading: isLoadingResumes || isLoadingVersion || isFetchingVersion || isLoadingVector || isFetchingVector,
    isLoadingEnrichment
  };
}
