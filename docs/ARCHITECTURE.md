# Implementation architecture

Next.js App Router + React + TypeScript, semantic CSS and Lucide icons. Fonts and photos are local assets. There is no chart runtime dependency, no backend and no environment-specific configuration.

## Boundaries

- `src/lib/types.ts`: domain types for agents, profiles, production, monthly history, transactions, goals, achievements, wealth accounts/contributions, vendors/categories, events/Broker Opens/listings, notifications and tools.
- `src/data/mock.ts`: the single fixture source, dated September 21, 2026. Transaction and contribution generation reconciles with the monthly series. No real person or account is represented.
- `src/lib/service.ts`: the mock workspace read boundary, period aggregation and formatting. Module fixture imports will move behind an authenticated API loader when real data arrives; the typed records and presentation components can stay. Future network loading should introduce a workspace query/provider using those contracts rather than scatter fetches inside cards.
- `src/lib/auth.tsx`: replaceable authentication adapter and one shared session context.
- `src/components/ui.tsx`: reusable native dialog, headings and local external-store hook. The store publishes same-tab changes and listens for cross-tab storage events so profile names/favorites stay synchronized across consumers.
- Focused production, wealth, vendor, event and account components render those records. Shell owns navigation, search, notifications and shared detail entry points.
- `src/app/[[...route]]/page.tsx`: known-route validation and one shared workspace entry. Unknown paths invoke `notFound()`. This compact registry is appropriate for the demo; production modules can split into route groups with server loaders as data grows.

## State

Demo session: localStorage or sessionStorage, according to Remember me. Goals, period, profile, appearance, preferences, favorites, RSVP IDs and read-notification IDs: localStorage. Filters and open dialogs: component state. Vendor command results include a query parameter so the destination shows the selected partner. Browser history works for module navigation.

Local persistence is convenience only. Production must add server validation, user/tenant scope, migrations and policy enforcement. A storage-write failure displays an alert rather than silently implying a durable save.

## Financial semantics

Volume means closed side volume, not unique property aggregate. GCI is 2.5% of fictional side volume. The demo assumes that same amount as the net commission basis for the 10% Wealth Builder contribution, without splits/fees. All amounts are USD. The future program must define net commission before integration.

Pending volume is separate from actual closed production. Future months have zero actual volume and a prior-year comparison, not invented future closings. Annualized pace = actual YTD / 9 × 12; it is labeled through September and is not a prediction. Annual goals do not change when the period selector changes.

The Wealth Builder balance is opening balance $47,420 plus $21,000 confirmed contributions; pending $3,950 is excluded. Lifetime contributed principal is $62,100, with a $6,320 illustrative historical growth difference. Tests protect these reconciliations.

## Deployment

Standard Next.js Vercel project, Node >=20.9, `npm ci`, `npm run build`. No production deployment is part of this change. Public preview deployments expose all fictional data by design; do not substitute real data until authentication, authorization and RLS are implemented.

The optional CSV export uses a same-origin, read-only route handler at `/api/production-export` with attachment headers. It serializes only the centralized fictional transaction fixture. This public demo endpoint must gain server-side authentication and row-level authorization before ever reading real production data.
