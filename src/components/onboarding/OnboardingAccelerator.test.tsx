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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
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

    expect(screen.getByText(/Compare Job Link/i)).toBeInTheDocument();
    expect(screen.getByText(/Discover Matches/i)).toBeInTheDocument();
    expect(screen.getByText(/Try with Sample Job/i)).toBeInTheDocument();
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

  it('calls onImportClick when Compare Job Link option is clicked', () => {
    render(
      <OnboardingAccelerator 
        onManualClick={mockOnManualClick} 
        onImportClick={mockOnImportClick} 
      />
    );

    const importButton = screen.getByText(/Compare Job Link/i);
    fireEvent.click(importButton);

    expect(mockOnImportClick).toHaveBeenCalled();
  });

  it('navigates to discovery when Discover Matches option is clicked', () => {
    render(
      <OnboardingAccelerator 
        onManualClick={mockOnManualClick} 
        onImportClick={mockOnImportClick} 
      />
    );

    const discoverButton = screen.getByText(/Discover Matches/i);
    fireEvent.click(discoverButton);

    expect(mockNavigate).toHaveBeenCalledWith('/discovery');
  });

  it('calls onManualClick when Add Job Manually is clicked', () => {
    render(
      <OnboardingAccelerator 
        onManualClick={mockOnManualClick} 
        onImportClick={mockOnImportClick} 
      />
    );

    const manualButton = screen.getByText(/Add Job Manually/i);
    fireEvent.click(manualButton);

    expect(mockOnManualClick).toHaveBeenCalled();
  });
});
