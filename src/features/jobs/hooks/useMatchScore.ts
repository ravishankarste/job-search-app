import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useResumes } from '../../resumes/hooks/useResumes';
import { resumeService } from '../../resumes/services/resumeService';
import { matchAnalysisService } from '../services/matchAnalysisService';

export function useMatchScore(jobTitle: string, jobDescription: string | null, resumeId?: string | null) {
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

  // 3. Calculate score
  const calculation = React.useMemo(() => {
    if (!primaryResume) {
      console.log("[useMatchScore] No resume found for this user.");
      return { score: 0, matchingSkills: [], missingSkills: [], warnings: [], hasResumeText: false };
    }

    const combinedJobText = `${jobTitle || ''} ${jobDescription || ''}`.trim();
    const resumeText = (latestVersion?.content as any)?.extractedText || "";
    const fallbackText = `${primaryResume.target_role || ''} ${primaryResume.name || ''}`.trim();
    
    console.log(`[useMatchScore] Matching Job "${jobTitle}" against Resume "${primaryResume.name}"`, {
      resumeHasText: !!resumeText,
      fallbackText: fallbackText
    });

    const result = matchAnalysisService.calculateMatchScore(
      combinedJobText, 
      resumeText || fallbackText || "Software Engineer"
    );

    return {
      ...result,
      hasResumeText: !!resumeText
    };
  }, [jobTitle, jobDescription, latestVersion, primaryResume]);

  return {
    score: calculation.score,
    matchingSkills: calculation.matchingSkills,
    missingSkills: calculation.missingSkills,
    warnings: calculation.warnings || [],
    hasResumeText: calculation.hasResumeText || false,
    isLoading: isLoadingResumes || isLoadingVersion || isFetchingVersion
  };
}
