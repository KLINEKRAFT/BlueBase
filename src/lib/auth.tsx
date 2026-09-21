'use client';
import { createContext, useContext, useEffect, useState } from 'react';
interface Session {
  agentId: string;
  mode: 'demo';
}
interface AuthAdapter {
  getSession: () => Promise<Session | null>;
  signIn: (email: string, password: string, remember: boolean) => Promise<Session>;
  signOut: () => Promise<void>;
}
const key = 'bluebase:demo-session';
// This deliberately is not a security boundary. No passwords or real tokens are stored.
export const demoAuth: AuthAdapter = {
  async getSession() {
    try {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      const session = raw ? JSON.parse(raw) : null;
      return session?.mode === 'demo' && session?.agentId === 'agent-alexis' ? session : null;
    } catch {
      return null;
    }
  },
  async signIn(email, password, remember) {
    if (email.toLowerCase().trim() !== 'agent@bluebase.demo' || password !== 'demo123')
      throw new Error('Use agent@bluebase.demo and demo123 to explore BlueBase.');
    const session: Session = { agentId: 'agent-alexis', mode: 'demo' };
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      (remember ? localStorage : sessionStorage).setItem(key, JSON.stringify(session));
    } catch {
      throw new Error('Please enable browser storage to use the demo.');
    }
    return session;
  },
  async signOut() {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};
const AuthContext = createContext<{
  session: Session | null;
  ready: boolean;
  signIn: AuthAdapter['signIn'];
  signOut: () => Promise<void>;
} | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    demoAuth.getSession().then((s) => {
      setSession(s);
      setReady(true);
    });
    const sync = () => {
      demoAuth.getSession().then(setSession);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return (
    <AuthContext.Provider
      value={{
        session,
        ready,
        signIn: async (e, p, r) => {
          const s = await demoAuth.signIn(e, p, r);
          setSession(s);
          return s;
        },
        signOut: async () => {
          await demoAuth.signOut();
          setSession(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider required');
  return context;
}
