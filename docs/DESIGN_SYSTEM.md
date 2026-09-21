# BlueBase design system

## Source and translation

Before implementation, the following Manager Notices sources were reviewed through the authorized GitHub connection:

- `design-system/brand.md`
- `design-system/components.md`
- `design-system/architecture.md`
- `design-system/tokens.css`
- `design-system/tokens.json`
- Relevant typography and Supabase authentication code in `index.html`

`src/app/tokens.css` preserves the reference token values. `globals.css` adds semantic surface, text, border and status roles, responsive layouts and a dark palette. Manager Notices was read only.

The shared family comes from #012169 Coldwell Banker Blue, Midnight #0A1730, Slate #1B3C55, Smoky #58718D, Glacier #DAE1E8, Mist #BECAD7, Tide #B8CFEA, Icy #F0F5FB, Bright Blue #1F69FF and Celestial #418FDE. Gold appears sparingly, particularly in recognition and small brand details.

BlueBase uses the Icy canvas, white surfaces, 14px cards, navy-tinted depth, wide-tracked eyebrows and restrained hover movement. It does not copy Manager Notices' single-file PWA, manager reporting hierarchy, repeated recognition list, or large gradient hero. The BlueBase wordmark and layered icon identify the umbrella workspace, not one of the two companies.

## Typography

The display stack retains Bauziet → Familjen Grotesk. Familjen Grotesk is bundled as the open-source display fallback. Statistics use bundled Josefin Sans in the Geometos Neue role, with larger headline figures using the display face for a calm editorial appearance. Body text uses bundled Roboto. No runtime Google Fonts request is required. Proprietary font binaries embedded in the private reference were not redistributed; licensed Bauziet/Geometos assets can be added later.

## Hierarchy and interaction

Production volume is dominant. Closed sides, commission and average price are secondary; pipeline, goals and achievements are supporting information. The navy Wealth Builder card provides a visual counterweight. Vendor and Broker Open photography is illustrative and used for browsing context.

Achievement colors adapt Manager Notices' tier language: first/emerald, $1M/sky, $5M/indigo, $10M/navy, best-sale/royal blue, double-end/teal. No continuous sheen or glow competes with daily work.

Charts are lightweight CSS/SVG, with focusable data points and readable accessible names. Native `dialog` provides focus containment, Escape handling, backdrop and return focus. Controls have visible focus rings; status text accompanies color. Dialog titles remain available when long Broker Open content scrolls.

## Responsive and appearance

Desktop has a full sidebar. Tablet uses a compact icon rail. Mobile has a five-part bottom navigation with More, safe-area spacing, full-width content, vertically arranged goals, and contribution tables transformed into labeled cards. Category filters scroll within their own row. Long detail dialogs fit the viewport.

Dark mode uses Midnight-family surfaces with readable pale-blue actions. Light, Dark and System are locally persisted; System tracks the OS preference. All nonessential transitions and animations respect `prefers-reduced-motion`.
