import { PostgrestError } from '@supabase/supabase-js';

export class ApiError extends Error {
  public details: string;
  public hint: string;
  public code: string;

  constructor(error: PostgrestError | Error | unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      super((error as any).message);
      this.details = (error as any).details || '';
      this.hint = (error as any).hint || '';
      this.code = (error as any).code || '';
    } else {
      super('An unknown API error occurred');
      this.details = '';
      this.hint = '';
      this.code = '';
    }
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): never => {
  console.error('API Error:', error);
  throw new ApiError(error);
};
