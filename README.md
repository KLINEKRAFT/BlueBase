# BlueBase

A polished, interactive agent workspace for Coldwell Banker Select and Coldwell Banker Plaza. This first demo brings personal production, goals, Wealth Builder, trusted vendors, and community events into one shared application shell.

**Demo only:** every record is fictional. Browser-based sign-in is not security. No production APIs, Supabase project, email delivery, investment account, or SSO connection is enabled.

## Run locally

Node.js 20.9+ (Node 24 recommended), npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Sign in with **agent@bluebase.demo / demo123**. Credentials are prefilled so reviewers can jump straight in. Remember me uses localStorage; unchecked uses sessionStorage. Refresh preserves either session. Sign out from the avatar menu (More on mobile).

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

No environment variables are needed. Vercel can import the repository with its Next.js preset, `npm run build`, and the default output. This work does not provision or publish a hosting deployment.

## What works

- Personal production: YTD/quarter/month views, keyboard-accessible comparative chart, pending pipeline, CSV export, recent activity, annual goals, projected pace, achievement details.
- Goals, favorites, RSVPs, profile edits, notification read states/preferences, appearance, and period choice persist locally.
- Wealth Builder: balance history, confirmed/pending contribution filters, contribution history, annual contribution goal, program explanation.
- Vendor List: 18 fictional partners, 14 categories, area/search filters, favorites, detailed profiles.
- Events: 11 upcoming events, list/calendar views, detail dialogs, RSVPs, two Broker Opens with six and five listings, sponsors and illustrative routes.
- Tools: four working modules and five deliberately labeled future modules.
- Global Cmd/Ctrl+K search, unread notifications, profile, settings, resources, light/dark/system appearance.
- Desktop sidebar, compact tablet rail, mobile bottom navigation with More. Native dialogs support focus trapping, Escape dismissal, accessible titles, and return focus.

## Project map

```text
src/app/                 Next.js App Router, shared layout, brand tokens, responsive styles
src/components/          Workspace shell and focused module components
src/lib/types.ts         Domain contracts for future API integration
src/lib/auth.tsx         Auth adapter and shared session context (demo implementation)
src/lib/service.ts       Mock read boundary, production calculations and formatters
src/data/mock.ts         Single fictional dataset, fixed to September 21, 2026
tests/                   Auth behavior and financial/data reconciliation tests
public/images/           Local illustrative photos; no runtime image service dependency
docs/                    Product, architecture, design, asset and verification notes
```

The optional catch-all route validates a small route registry and renders the shared workspace. Unknown routes return Next.js 404. Modules share one session and typed domain data. Data aggregation lives outside rendering; no secrets or privileged calls exist in client code. See [architecture](docs/ARCHITECTURE.md) for the intended API boundary.

## Demo data and reset

The snapshot deliberately stays in September 2026 so sample events do not disappear with the actual date. Nine actual monthly periods and three future comparison periods are shown. $8.4M closed volume, 24 closed sides, and $210K GCI reconcile exactly. $21K confirmed and $3,950 pending contributions reconcile with transactions.

Local preferences are scoped to this fictional demo user and this browser/origin. They are not synchronized between devices. Clearing this site's browser storage resets the demo. Logging out clears the session but retains preferences. Do not enter private or sensitive information.

## Future authentication and data

Replace the demo adapter with Supabase Auth; add trusted profiles/company/office memberships, server-side session validation, and agent-scoped RLS. BlueBase owns identity for its internal modules. Separate applications need an identity-provider-backed SSO design, not copied browser storage or homemade JWTs. See [AUTH_ARCHITECTURE.md](docs/AUTH_ARCHITECTURE.md).

## Design lineage

The five Manager Notices design-system files were studied before implementation, along with its live `index.html` authentication flow. BlueBase uses the original color/shape/motion tokens with a new layout and agent-centered information hierarchy. No Manager Notices application files were modified. Licensed open-source font fallbacks are bundled; private embedded commercial font files were not copied. See [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) and [ASSETS.md](docs/ASSETS.md).
