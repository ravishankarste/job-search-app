import { describe, it, expect, vi, beforeEach } from 'vitest';
import { followupService } from './followupService';
import { supabase } from '../../../lib/supabaseClient';

// Mock Supabase
vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('followupService Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUpcomingTasks strictly filters by the current user ID', async () => {
    const mockUser = { id: 'user-123' };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockIs = vi.fn().mockReturnThis();
    
    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      is: mockIs,
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    });

    await followupService.getUpcomingTasks();

    // PROOF OF ISOLATION:
    // Check if the query specifically includes the profile_id filter for user-123
    expect(mockEq).toHaveBeenCalledWith('application.profile_id', 'user-123');
  });

  it('getFollowupsByApplication verifies ownership before fetching', async () => {
    const mockUser = { id: 'user-123' };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });

    const mockEq = vi.fn().mockReturnThis();
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: mockEq,
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'app-456' }, error: null }),
    });

    await followupService.getFollowupsByApplication('app-456');

    // PROOF OF ISOLATION:
    // It should first check if application app-456 belongs to user-123
    expect(mockEq).toHaveBeenCalledWith('id', 'app-456');
    expect(mockEq).toHaveBeenCalledWith('profile_id', 'user-123');
  });
});
