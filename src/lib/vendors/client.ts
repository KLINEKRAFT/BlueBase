import type {
  DirectorySnapshot,
  RecommendationInput,
  RecommendationReceipt,
  ReviewInput,
} from './types';
async function response<T>(result: Response): Promise<T> {
  const body = await result.json();
  if (!result.ok) throw new Error(body.error || 'The directory is unavailable. Please try again.');
  return body;
}
// The existing BlueBase session owns access to this bridge. Published demo credentials establish
// only the fixed sample agent. Replace with validated Supabase identity before real-user deployment.
export async function startDirectorySession() {
  return response(
    await fetch('/api/vendor-directory/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'agent@bluebase.demo', password: 'demo123' }),
    }),
  );
}
export async function loadDirectory(): Promise<DirectorySnapshot> {
  return response(await fetch('/api/vendor-directory', { cache: 'no-store' }));
}
export async function submitRecommendation(
  data: RecommendationInput,
): Promise<RecommendationReceipt> {
  return response(
    await fetch('/api/vendor-directory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recommend', data }),
    }),
  );
}
export async function submitReview(data: ReviewInput): Promise<{ suspended: boolean }> {
  return response(
    await fetch('/api/vendor-directory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review', data }),
    }),
  );
}
