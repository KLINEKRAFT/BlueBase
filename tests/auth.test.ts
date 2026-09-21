import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoAuth } from '../src/lib/auth';
function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v),
    removeItem: (k: string) => values.delete(k),
  };
}
test('demo auth validates credentials, honors remember me, recovers invalid sessions, and logs out', async () => {
  const local = memoryStorage(),
    session = memoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: local, configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: session, configurable: true });
  assert.equal(await demoAuth.getSession(), null);
  await assert.rejects(() => demoAuth.signIn('wrong@example.com', 'bad', true));
  await demoAuth.signIn('agent@bluebase.demo', 'demo123', true);
  assert.equal((await demoAuth.getSession())?.mode, 'demo');
  assert.ok(local.getItem('bluebase:demo-session'));
  assert.equal(session.getItem('bluebase:demo-session'), null);
  assert.ok(!local.getItem('bluebase:demo-session')?.includes('demo123'));
  await demoAuth.signOut();
  assert.equal(await demoAuth.getSession(), null);
  await demoAuth.signIn('agent@bluebase.demo', 'demo123', false);
  assert.equal(local.getItem('bluebase:demo-session'), null);
  assert.ok(session.getItem('bluebase:demo-session'));
  await demoAuth.signOut();
  local.setItem('bluebase:demo-session', '{bad');
  assert.equal(await demoAuth.getSession(), null);
  local.setItem('bluebase:demo-session', JSON.stringify({ agentId: 'someone-else', mode: 'demo' }));
  assert.equal(await demoAuth.getSession(), null);
});
