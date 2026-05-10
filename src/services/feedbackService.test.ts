import { describe, it, expect, vi, beforeEach } from 'vitest';
import { feedbackService } from './feedbackService';
import { supabase } from '../lib/supabaseClient';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('feedbackService Sovereign Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submitFeedback scribes the correct sentiment and context into the vault', async () => {
    const mockFeedback = {
      sentiment: 'love',
      path: '/dashboard',
      user_id: 'user-123'
    };

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({
      insert: mockInsert,
    });

    await feedbackService.submitFeedback(mockFeedback);

    // PROOF OF CAPTURE:
    // Verify that the insert call contains the exact intelligence payload
    expect(supabase.from).toHaveBeenCalledWith('user_feedback');
    expect(mockInsert).toHaveBeenCalledWith([
      {
        sentiment: 'love',
        content: undefined,
        path: '/dashboard',
        user_id: 'user-123',
      },
    ]);
  });

  it('submitFeedback captures anonymous sentiment without user_id', async () => {
    const mockFeedback = {
      sentiment: 'confused',
      path: '/login'
    };

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({
      insert: mockInsert,
    });

    await feedbackService.submitFeedback(mockFeedback);

    // PROOF OF CAPTURE:
    expect(mockInsert).toHaveBeenCalledWith([
      {
        sentiment: 'confused',
        content: undefined,
        path: '/login',
        user_id: undefined,
      },
    ]);
  });

  it('submitFeedback gracefully handles scribe failures', async () => {
    const mockFeedback = {
      sentiment: 'love',
      path: '/dashboard'
    };

    const mockError = new Error('Database connection failed');
    const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
    (supabase.from as any).mockReturnValue({
      insert: mockInsert,
    });

    // We expect the error to be caught or handled by handleApiError
    // Since handleApiError is likely logged, we just ensure the service doesn't throw and crash the UI
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await feedbackService.submitFeedback(mockFeedback);
    
    expect(consoleSpy).toHaveBeenCalledWith('[Intelligence] Failed to scribe feedback:', expect.any(Object));
    consoleSpy.mockRestore();
  });
});
