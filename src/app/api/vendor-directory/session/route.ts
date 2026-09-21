import { NextRequest, NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/server/request-origin';
import {
  directoryDb,
  createDemoSession,
  revokeDemoSession,
  sessionAgent,
} from '@/lib/server/vendor-repository';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  try {
    const { email, password } = await request.json();
    if (email !== 'agent@bluebase.demo' || password !== 'demo123')
      return NextResponse.json({ error: 'Invalid demo credentials.' }, { status: 401 });
    const db = directoryDb();
    let token = request.cookies.get('bluebase-vendor-session')?.value;
    try {
      sessionAgent(db, token);
    } catch {
      token = createDemoSession(db);
    }
    const response = NextResponse.json({ mode: 'demo', agentId: 'agent-alexis' });
    response.cookies.set('bluebase-vendor-session', token!, {
      httpOnly: true,
      sameSite: 'strict',
      secure: request.nextUrl.protocol === 'https:',
      path: '/',
      maxAge: 86400,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    return NextResponse.json(
      {
        error:
          'The persistent directory is unavailable. This host needs a durable database connection.',
      },
      { status: 503 },
    );
  }
}
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  try {
    revokeDemoSession(directoryDb(), request.cookies.get('bluebase-vendor-session')?.value);
  } catch {}
  const response = NextResponse.json({ signedOut: true });
  response.cookies.delete('bluebase-vendor-session');
  return response;
}
