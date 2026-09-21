// Next's internal URL may use localhost while the browser uses 127.0.0.1.
// Compare with the actual Host header, never an arbitrary forwarded host.
export function sameOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get('origin') || '');
    return (
      ['https:', 'http:'].includes(origin.protocol) && origin.host === request.headers.get('host')
    );
  } catch {
    return false;
  }
}
