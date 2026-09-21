# Verification — September 21, 2026

## Automated checks

- ESLint: no errors or warnings.
- TypeScript: `tsc --noEmit` passes.
- Production: `next build` passes.
- Node test suite: five passing tests cover demo credential/session handling, remember-me storage choice, logout and malformed sessions, reconciliation of monthly/transaction/contribution totals, period filtering, fixture coverage and stable IDs, and CSV attachment contents/headers.
- Package installation audit: no known vulnerabilities reported by npm at install time.

## Browser checks

The application was run locally and exercised in the Codex in-app browser.

- 1440px desktop: login, production hierarchy, vendor cards, Broker Open details and dark production visually reviewed.
- 1280px laptop, 768px tablet and 320px small-mobile production: no document horizontal overflow. Tablet rail and responsive layout inspected.
- 390 × 844 mobile: all eight workspace routes checked, with no horizontal overflow, broken loaded images or unnamed visible buttons. Production, Wealth Builder and Broker Open detail layouts visually inspected.
- Goal change from $12M to $14M updated progress from 70% to 60% and persisted after reload; restored to $12M.
- YTD/month filters update production and chart data.
- Vendor category filter, favorite toggle/detail and refresh persistence verified. Command search for roofing lists matching vendors and selecting one filters the destination to that vendor.
- Six-listing Broker Open verified on desktop and mobile. RSVP persisted after refresh; native detail dialog fit mobile width.
- Event list/calendar toggle verified on mobile, including September and October events.
- Wealth contribution status filter produced three pending rows; mobile contribution rows become labeled cards.
- Profile name changes saved and propagated to the production identity; original demo name restored.
- Appearance and notification preferences save. Dark appearance survives refresh. Light and dark reviewed visually.
- Notification Mark all read cleared the unread count.
- Cmd/Ctrl+K opened search, Escape closed its native dialog. Visible controls expose accessible labels; this is not a formal accessibility certification.
- CSV export produced a browser download using the same-origin attachment route.
- Sign out returned to login; reloading stayed signed out. Subsequent demo sign-in worked.
- No browser console errors observed during the final module sweep. An earlier Next.js smooth-scroll warning was resolved by declaring `data-scroll-behavior="smooth"` on the document.

## Deliberate limits

This was not a physical iOS/Android device test or a complete browser matrix. Production data/auth/security, real mail, real RSVPs, vendor communication, live maps, financial transfers and federated SSO are not implemented. Browser-local state does not sync across devices. The CSV endpoint serves only fictional fixtures and is intentionally public until production authorization is added.
