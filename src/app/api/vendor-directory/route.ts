import { NextRequest, NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/server/request-origin';
import { directoryDb, VendorRepository, sessionAgent } from '@/lib/server/vendor-repository';
import { DirectoryError } from '@/lib/vendors/validation';
export const runtime = 'nodejs';
function failure(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof DirectoryError
          ? error.message
          : 'We couldn’t save your change. Please try again.',
    },
    {
      status: error instanceof DirectoryError ? error.status : 500,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
export async function GET(request: NextRequest) {
  try {
    const db = directoryDb();
    const agent = sessionAgent(db, request.cookies.get('bluebase-vendor-session')?.value);
    return NextResponse.json(new VendorRepository(db).snapshot(agent), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 16000) throw new DirectoryError('This request is too large.', 413);
    const input = JSON.parse(raw);
    const db = directoryDb();
    const agent = sessionAgent(db, request.cookies.get('bluebase-vendor-session')?.value);
    const repository = new VendorRepository(db);
    if (input.action === 'recommend')
      return NextResponse.json(repository.recommend(agent, input.data), { status: 201 });
    if (input.action === 'review') return NextResponse.json(repository.review(agent, input.data));
    throw new DirectoryError('Unknown directory action.');
  } catch (error) {
    return failure(error);
  }
}
