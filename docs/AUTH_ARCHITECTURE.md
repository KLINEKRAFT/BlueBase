# BlueBase identity and session architecture

BlueBase should own the agent identity and session for its workspace. Internal modules use the same authenticated identity and never ask agents for another password.

## Demo now

`src/lib/auth.tsx` defines an AuthAdapter and a shared AuthProvider. The demo adapter validates the published fictional credentials and stores only `{ agentId, mode: 'demo' }` in localStorage (Remember me) or sessionStorage. It restores that state on refresh and clears both locations on sign-out. It does not store the password.

**This is not secure authentication or authorization.** Anyone can edit browser storage, inspect the client dataset, or bypass the UI gate. The application has no protected production resource. All mock data ships to the browser. There are no API credentials, production API calls, real tokens, homemade signed tokens, or security claims.

Preferences and local edits use separately namespaced `bluebase:*` keys. Sign-out preserves them for demo convenience. Before introducing more than one real user, replace that demo persistence with authenticated, per-user storage and clear sensitive caches on account changes.

## Reference reviewed

Manager Notices uses Supabase email/password sign-in (`signInWithPassword`), initial `getSession`, `onAuthStateChange` for password recovery, `resetPasswordForEmail` with an origin-relative redirect, and `signOut`. Its architecture describes `profiles`, `office_scopes`, role helpers, office-scoped RLS, security-definer RPCs, and server-side brokerage feed credentials.

BlueBase carries forward the single profile and explicit office scope concepts. Its agent-facing default must be stricter than the manager view: agents read their own production and contributions. Manager/admin access must be granted explicitly by trusted membership records. Copying a client profile role is not authorization.

## Phase 2: Supabase Auth and trusted data

1. Replace the demo AuthAdapter with Supabase Auth. In Next.js, use the current official `@supabase/ssr` browser/server integration and supported cookie/session refresh pattern. Never trust an unverified browser session object for server authorization.
2. Create `profiles` with `id` referencing `auth.users.id`, display/contact data, and an agent identity reference. Model company/office memberships and roles in trusted tables; user-editable metadata must not grant company, office or admin access.
3. Model company/office ownership on production and relevant workspace data. Enable RLS for every exposed table; test agent isolation, cross-company isolation, manager scope and admin access with separate identities.
4. Gate server components, server actions, route handlers and every data operation using validated identity and authorization. Hiding a route or filtering client data is insufficient.
5. Use least-privileged ingestion jobs for transaction and contribution feeds; validate and reconcile records server-side. Keep service-role keys, database credentials and upstream privileged API credentials server-side, never in `NEXT_PUBLIC_*` variables.
6. Configure allowed redirect URLs, account recovery, invitations, session expiry/revocation, rate limits, audit logging and support procedures. Validate auth flows on preview and production origins; do not allow arbitrary redirect destinations.
7. Replace local goals/profile/favorites/RSVP records with per-user tables. Add conflict, offline and error handling. Do not import arbitrary demo browser records as trusted production data.

## Phase 3: separately hosted tools

Prefer bringing tools into BlueBase modules under the same application session. If a tool remains separate, first choose a supported identity-provider-based SSO architecture compatible with Supabase and the tools involved (for example a shared organizational identity provider using supported federation). A common Supabase project alone does **not** automatically share a browser session across unrelated origins.

Each relying application must establish and validate its own appropriate session through the approved provider flow, with registered/allowlisted callbacks and standard protections such as state, nonce and PKCE where applicable. Evaluate the provider's current supported OAuth/OIDC or SAML capabilities and product constraints before committing to a handoff design.

Do not pass tokens in query strings, copy localStorage between origins, share application passwords, create homemade JWTs, or weaken cookie boundaries to imitate SSO. Logout/revocation, audience/issuer checks, tenant membership and audit trails require an explicit design and security review before connecting separate tools. Supabase SAML sign-in and outbound identity-provider functionality are distinct capabilities; verify the chosen topology against current documentation.

## Official references

- [Supabase server-side clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase session/SSR advanced guidance](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Next.js documentation](https://nextjs.org/docs)

No phase 2 or phase 3 authentication code is enabled in this demo.
