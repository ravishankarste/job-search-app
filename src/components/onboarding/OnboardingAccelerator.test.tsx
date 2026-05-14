import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingAccelerator } from './OnboardingAccelerator';
import { useJobActions } from '../../features/jobs/hooks/useJobActions';

// Mock the hooks and analytics
vi.mock('../../features/jobs/hooks/useJobActions', () => ({
  useJobActions: vi.fn()
}));

vi.mock('../../lib/analytics', () => ({
  trackEvent: vi.fn()
}));

describe('OnboardingAccelerator', () => {
  const mockOnManualClick = vi.fn();
  const mockOnImportClick = vi.fn();
  const mockCreateJob = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useJobActions as any).mockReturnValue({
      createJob: mockCreateJob,
      isCreating: false
    });
  });

  it('renders all onboarding options', () => {
    render(
      <OnboardingAccelerator 
        onManualClick={mockOnManualClick} 
        onImportClick={mockOnImportClick} 
      />
    );

    expect(screen.getByText(/Try with Sample Job/i)).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn URL Import/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Job Manually/i)).toBeInTheDocument();
  });

  it('triggers sample injection when "Try with Sample Job" is clicked', async () => {
    render(
      <OnboardingAccelerator 
        onManualClick={mockOnManualClick} 
        onImportClick={mockOnImportClick} 
      />
    );

    const sampleButton = screen.getByText(/Try with Sample Job/i);
    fireEvent.click(sampleButton);

    expect(mockCreateJob).toHaveBeenCalledWith(expect.objectContaining({
      company_name: 'Netflix',
      title: 'Senior Software Engineer (UI)'
    }));
  });

  it('calls onImportClick when LinkedIn option is clicked', () => {
    render(
      <OnboardingAccelerator 
        onManualClick={mockOnManualClick} 
        onImportClick={mockOnImportClick} 
      />
    );

    const importButton = screen.getByText(/LinkedIn URL Import/i);
    fireEvent.click(importButton);

    expect(mockOnImportClick).toHaveBeenCalled();
  });
});
