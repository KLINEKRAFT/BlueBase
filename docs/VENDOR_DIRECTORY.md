# Vendor List — first functional pass

Integrated into the existing Next.js workspace, authentication context, sidebar/mobile navigation, native dialogs, typography, light/dark tokens and global search. No separate app or public vendor registration was introduced.

## Functional locally

- Five company cards and detailed profiles; search by company, service, category or market; category/market filters; saved favorites; empty, loading and retry states.
- Multi-category and multi-market recommendation form, required Other description, database persistence, pending status, server-associated demo agent, submission time, validation, idempotent same-agent retries, existing-vendor detection, confirmation and submission history.
- One current 1–5 rating per agent/vendor, editable experience type and optional comment, aggregate/distribution/comments, prior revision history. No Google/Yelp scores.
- Verified current charity contributions and completed approval/invitation/onboarding are required for browse. Null rating is allowed and displayed as unrated. A score below the configured minimum suspends a vendor; the database record, reviews and history remain. Suspended vendors leave browse and global search but remain in the submitting agent's Your reviews view. Improving a rating does not automatically reinstate a vendor.
- A contribution approaching renewal remains eligible until expiry; expired, pending, rejected, underfunded and inactive-charity contributions do not qualify. Reads and writes reconcile date eligibility. SQL triggers enforce suspension after review insert/update or a raised threshold.
- Tiffany notification intent is persisted atomically with each recommendation in `notification_outbox`, through a provider-neutral notification module. No email has been sent and no email worker/provider exists yet.

## Architecture and schema

`src/components/vendors.tsx` coordinates the page. `src/components/vendor-directory/` contains reusable card/logo, profile/reviews and recommendation form. `src/app/vendors.css` extends existing tokens and responsive patterns. `src/lib/vendors/` holds typed contracts, seeds, validation, API client and shared cache. The shell's search uses the same eligible server snapshot.

`src/app/api/vendor-directory/` contains Node route handlers. `src/lib/server/vendor-repository.ts` owns SQLite persistence/eligibility; `vendor-notifications.ts` provides an EmailTransport contract and transactional outbox enqueue. `request-origin.ts` checks mutations against the actual request host.

`db/migrations/001_vendor_directory.sql` creates agents/sessions, settings, vendors, contacts, categories and vendor junctions, service areas and junctions, recommendations and junctions, invitations (hashed token, expiry, acceptance/revocation), reviews and revisions, charities, contributions, status history and outbox. Invitations/onboarding/admin operations are schema foundations; there are no unauthenticated public onboarding endpoints. Source URL/check date and explicit sample flags preserve provenance. Contacts include optional social data. Categories, markets, approved charities and thresholds are database records, changeable without code deployment.

The local repository creates/seeds an empty database automatically and enables foreign keys/WAL. Version 1 is idempotent; future schema alterations must have an explicit versioned migration. This is a single-host demo adapter; production should use the planned Supabase/Postgres boundary with transactional mutations, RLS, authenticated admin roles, private contribution documents and scheduled renewal reconciliation. Do not put this SQLite database on an ephemeral serverless filesystem.

Run `npm run vendors:inspect` for an internal terminal report of recommendations, status reasons, notification outbox and history. There was no admin area to extend, so no agent-accessible pretend admin page was added.

## Configuration

Node 24+ is required. No new npm dependencies or secrets are needed for local execution.

- `BLUEBASE_VENDOR_DB_PATH`: optional absolute path on a persistent volume; defaults to `.data/vendor-directory.sqlite`.
- `VENDOR_ADMIN_EMAIL`: server-only notification recipient, defaults to `tiffanyv@cbtulsa.com`.
- `BLUEBASE_VENDOR_STORAGE=disabled`: explicitly disable the directory API. `VERCEL` also disables this local adapter.
- `vendor_settings`: `minimum_rating=4`, `annual_contribution=200` (whole dollars), `renewal_months=12`, `renewal_notice_days=30`. Configured renewal interval caps recorded contribution validity. Alter these through a trusted database connection; never client-provided values.

Back up the SQLite database before changes. To start a fresh disposable demo, stop the server and move `.data/` to a backup folder, then restart. Browser favorites and other workspace preferences remain in browser storage.

## Identity and demo boundaries

Existing BlueBase authentication is a public demonstration credential, **not production authentication**. The directory bridges that identity to an opaque HttpOnly SameSite cookie and a server session mapped to the fixed seeded agent. Mutation payloads cannot choose the agent ID. This prevents accidental client-side identity mixing but does not make publicly known demo credentials secure. Replace the adapter with verified BlueBase identity and agent/admin authorization before collecting real contact details or opinions. No real donation verification, charity affiliation, approvals or invitations are claimed.

All internal ratings, review comments, referring agents, memberships, contribution verification and dates are synthetic sample records. The UI labels these visibly. Placeholder charities are literally Sample charity A/B/C. Initials are deliberate fallback marks, not company logos. The notification outbox is functional persistence; delivery, invitation issuance/acceptance, a vendor portal, payment/charity verification, admin UI and renewal reminders are next-pass work.

## Company facts and sources

Checked September 21, 2026. Facts are paraphrased from first-party sites; missing named contacts/emails are omitted rather than invented. Use website actions for missing contacts. Check the company directly for current terms and service coverage.

| Company                 | First-party source                | Seeded factual information                                                                                          |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| AMC Mortgage            | https://amcmtg.com/               | Mortgage services, Tulsa and Oklahoma City locations, Tulsa phone 918-491-9900                                      |
| Executives Title        | https://www.executivestitle.com/  | Tulsa/Sapulpa offices, residential/commercial/land-ranch/1031/FSBO closings, Tulsa phone 918-745-9977               |
| Spartan Home Inspection | https://www.spartaninspector.com/ | Home/termite inspections, Greater Tulsa communities, 918-888-6867, joseph@spartaninspector.com                      |
| Achosa Home Warranty    | https://www.achosahw.com/         | Home protection service contracts for eligible systems/appliances, contractor choice subject to terms, 888-509-2916 |
| First American          | https://www.firstam.com/          | Title insurance, settlement and related services, website link to home warranty                                     |

Achosa and First American's “Multi-market / National” directory market labels come from the requested demo brief; they are not assertions of universal plan availability. Public customer ratings were deliberately not used.

## Validation

Repository tests cover seed/taxonomy, pending recommendation persistence and retry deduplication, multi-category/market, invalid input and unknown agent, review uniqueness/edit history, exact 4.0 boundary, suspension/hiding, retained own-review access, no automatic reinstatement, contribution expiry/verification/amount/charity, configuration changes, calendar boundaries, session revocation and origin rejection. Existing production/auth/CSV tests remain intact. Browser QA results are recorded in the delivery notes.

## Next pass

Connect real agent/admin identity and a durable hosted database, then add Tiffany's review/invitation queue, hashed single-use invitation acceptance, private contribution evidence/verification, charity management, a scheduled renewal process and an idempotent outbox worker with a real email adapter. Confirm reinstatement policy, allowed unrated vendors and approved charity names before live use.

### Browser delivery check — September 21, 2026

Verified the directory at 1280×720 and 390×844, plus light/dark appearance. Checked market empty results (Wichita), multi-category/market filtering (Termite + Tulsa), company search, keyboard clearing, global search routing, mobile card/profile/form layout, contact links, Escape dismissal and restored focus. At 390px the document scroll width was exactly 390px; the profile and recommendation dialog remained within the viewport. A missing accessible label on the mobile saved filter was corrected.

Submitted “Sample QA Home Services” using example.com contact details; the UI showed the persistent pending receipt and explicit unsent-email disclosure. A separate process verified its database recommendation and Tiffany outbox row. Submitted and edited an AMC sample review; its count stayed at 19 after editing, with the updated score/comment visible. These clearly labeled QA records remain in the local demo database and are not committed. Fresh databases start with the original five seeds.

Production, Wealth Builder, Events and Settings still rendered correctly during browser smoke checks. Browser warning/error logs were empty. `npm test` (13 tests), `npm run lint`, `npm run typecheck`, `npm run build`, `npm run format:check` and `git diff --check` passed. Suspension, contribution and duplicate validation paths were covered in isolated database tests rather than changing eligibility of the five visible local sample profiles.
