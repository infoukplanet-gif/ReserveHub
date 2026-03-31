# ReserveHub Design System

## Visual Theme & Atmosphere

Clean, structured, professional. Inspired by Notion, Linear, and Stripe Dashboard.
No gradients anywhere. No AI-generated illustrations. No glow or neon effects.
Flat solid colors with a white-and-gray foundation and a single blue accent.
Beauty comes from structure, whitespace, and typographic hierarchy — not decoration.
The interface should feel like a well-organized desk, not a marketing brochure.

## Color Palette & Roles

- **Action Blue** (#2563EB) — Primary call-to-action buttons and active states. Only one primary button per screen.
- **Deep Action Blue** (#1D4ED8) — Hover and pressed state for primary buttons.
- **Soft Action Background** (#EFF6FF) — Selected card backgrounds, active tab backgrounds.
- **Accent Violet** (#7C3AED) — Ticket/coupon badges only. Never for general buttons.
- **Confirmed Green** (#16A34A) — Completed, confirmed, or active status indicators only.
- **Alert Amber** (#F59E0B) — Expiring-soon or attention-needed status indicators only.
- **Critical Red** (#DC2626) — Delete buttons, error messages, cancelled status only.
- **Page Canvas** (#F8FAFC) — Full page background. A barely-warm gray.
- **Card Surface** (#FFFFFF) — Card, sheet, modal interior. Pure white.
- **Subtle Border** (#E2E8F0) — Card borders, input borders, table row separators.
- **Primary Text** (#0F172A) — Headings, body text, prices. Nearly black.
- **Secondary Text** (#64748B) — Supplementary text, placeholders, timestamps.
- **Faint Text** (#94A3B8) — Disabled states, captions.

## Typography Rules

Font family: Inter for Latin characters, Noto Sans JP for Japanese. System sans-serif fallback.

- **Display** (36px, Bold, 1.2 line-height) — Hero headline on the public homepage only.
- **Heading 1** (28px, Bold, 1.3) — Page title. Exactly one per page.
- **Heading 2** (22px, SemiBold, 1.3) — Section headings within a page.
- **Heading 3** (18px, SemiBold, 1.4) — Card titles, list item names.
- **Body** (15px, Regular, 1.6) — Paragraphs, descriptions, form help text.
- **Body Small** (13px, Regular, 1.5) — Table cells, form labels, compact UI.
- **Caption** (11px, Regular, 1.4) — Timestamps, footnotes. Only for short text.
- **Price Large** (28px, Bold, 1.2) — Total price display only.
- **Price Medium** (18px, SemiBold, 1.3) — Menu item prices.
- **Price Small** (14px, Medium, 1.4) — Option prices, line item breakdowns.

Japanese body text must never be smaller than 15px. Smaller sizes only for short labels.

## Component Stylings

### Buttons
Solid flat colors, no gradients. Corner radius 8px for all sizes.
- **Primary**: Action Blue background, white text. One per screen maximum.
- **Outline**: Transparent background, Action Blue border and text.
- **Ghost**: Transparent, Secondary Text color. For low-priority actions.
- **Danger**: Critical Red background, white text. Only for delete confirmations.

Sizes: Small (32px height), Medium (40px), Large (48px).
Hover: background darkens to Deep Action Blue. Press: scale down to 98%.

### Cards
White surface, 1px Subtle Border, 12px corner radius, light shadow (0 1px 2px rgba(0,0,0,0.05)).
Padding: 24px on desktop, 16px on mobile.
Selectable cards on hover: border darkens slightly, shadow increases. Selected: Action Blue border, Soft Action Background fill.

### Inputs
Height 40px, 8px corner radius, 1px Subtle Border.
Focus: 2px Action Blue border with a faint blue ring.
Error: Critical Red border with red error message below.

### Badges (Status)
Pill-shaped (full rounding), 12px font, light colored background with darker text.
confirmed=blue, completed=green, cancelled=red, expired=red, warning=amber, draft=gray.

### Tables
Header: Page Canvas background, Secondary Text, 13px SemiBold.
Rows: 15px Regular, 12px vertical padding, 1px bottom border.
Hover row: Page Canvas background.

### Sidebar (Dashboard)
240px wide on desktop, hidden on mobile (opens as a sheet).
White background, 1px right border.
Active item: Soft Action Background, Action Blue text, SemiBold weight.

### Sheets (Right slide-in panels)
480px wide on desktop, 90vw on mobile.
White background, left shadow. Dark overlay behind.

### Toast Notifications
Top-right corner. White card, 12px radius, left color bar (4px).
Green bar for success, red for error, blue for info. Auto-dismiss after 5 seconds.

## Layout Principles

### Spacing
Base unit: 4px. All spacing uses multiples of 4.
Element gaps within cards: 12px. Card padding: 24px. Section gaps: 32px. Page section gaps: 48-64px.
Same-level elements always have identical spacing. Proximity indicates relationship.

### Grid
Mobile (<768px): single column, 16px page margins.
Tablet (768-1023px): two columns, 24px margins.
Desktop (≥1024px): twelve-column grid, 24px gutters, 32px page margins.

Dashboard layout: fixed 240px sidebar + fluid main content (max 1200px).
Public pages: max 1080px centered. Auth forms: max 400px centered.

### Responsive behavior
Mobile-first. Sidebar becomes a slide-in sheet on mobile.
Dashboard stat cards: 2×2 grid on mobile, 4-column on desktop.
Calendar: day view only on mobile with swipe navigation.

## Animation Rules

Only three timing functions exist. Do not add more.
- **ease-default**: cubic-bezier(0.4, 0, 0.2, 1) — general transitions
- **ease-enter**: cubic-bezier(0, 0, 0.2, 1) — elements appearing
- **ease-exit**: cubic-bezier(0.4, 0, 1, 1) — elements disappearing

Only four durations exist. Do not add more.
- **instant** (100ms) — hover color changes, button press
- **fast** (200ms) — sheet open/close, tab switch, card selection
- **normal** (300ms) — toast appear, stepper advance
- **slow** (600ms) — number count-up on dashboard

Every animation must communicate a state change. No decorative animation.
Respect prefers-reduced-motion: set all durations to 0ms when active.

## Do's and Don'ts

### Do
- Use flat, solid colors everywhere
- Let whitespace and alignment create visual hierarchy
- Show loading skeletons (shimmer effect) while data loads
- Show empty states with icon + message + action button
- Make price changes visually obvious (highlight flash on update)

### Don't
- Use gradients of any kind (linear, radial, mesh, aurora)
- Use AI-generated illustrations or stock illustrations
- Use glow, neon, bloom, or luminous effects
- Use pill-shaped buttons (full rounding is for badges only)
- Use dark backgrounds for landing pages
- Use decorative animations that don't signal state changes
- Place more than one primary button per screen
- Display icons without text labels (except × close and ← back)
