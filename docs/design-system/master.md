# MyPost Design System

Status: Source of Truth for `apps/MyPost.Web`  
Version: 2.0 — Modernized with UI/UX Pro Max Intelligence (2026-09-22)

## Provenance

Updated and modernized using design intelligence synthesized from `nextlevelbuilder/ui-ux-pro-max-skill`:
- **Domain & Product Palette**: Logistics / Delivery (#49) — Trust Blue (`#2563EB` / `#3B82F6`) paired with Delivery Orange (`#EA580C` / `#FB923C`)
- **Visual Style**: Modern Logistics Glass + Swiss Modernism 2.0 (crisp geometric typography, subtle backdrop blur, refined route-grid patterns, tactile micro-interactions)
- **Typography**: `Plus Jakarta Sans` for titles/headings, `Inter` for interface controls/body text, and `JetBrains Mono` for tabular identifiers and tracking codes
- **Accessibility & Quality**: WCAG 2.2 AA compliant contrast, 44px+ touch targets, zero Cumulative Layout Shift (CLS) geometry-matched skeleton states, and explicit textual equivalents for all chart data

## Product character

MyPost is a virtual postal operations product: precise, reassuring, efficient, and visibly honest about simulated data. The visual language balances Swiss structure with modern glass accents: a firm grid, left-aligned type, restrained color, clear rules, and route-line motifs that explain movement. It must never imply a real external postal service, real-time vehicle position, payment settlement, or a live carrier integration.

## Product patterns

- **Public experience**: Sticky glassmorphic header, tracking as the primary above-fold task with one-click demo chips, interactive parcel journey visualizer, bento-grid feature showcase, and transparent virtual-demo disclosure.
- **Authentication**: Split-layout presentation highlighting enterprise security principles (PBKDF2 hashing, rotating HttpOnly refresh cookies, in-memory tokens), real-time password requirement checklist, and one-click quick demo login buttons for review.
- **Customer workspace**: Overview KPI cards with active journey counters, segmented filter tabs (All/Active/Delivered), instant search, and guided 4-step shipment creation with live dimension validation.
- **Courier workspace**: Mobile/tablet-first touch-friendly assignment cards, quick tracking copy, destination tags, and strict state-guarded delivery outcome forms.
- **Operations console**: Network overview with status distribution telemetry, direct queue navigation links, and administrative courier allocation.
- **Shipment detail**: Header band → current-state summary → next legal actions → chronological status timeline → address and package facts.
- **Tables**: Desktop table from 768px; stacked labelled records below 768px. Search and status filters remain visible and results are paginated.

## Color tokens

All component colors reference semantic tokens declared in `src/styles.css`; raw values do not appear in components.

| Token | Light | Dark | Use |
|---|---:|---:|---|
| `canvas` | `#F8FAFC` | `#090D16` | Application background (Obsidian in dark mode) |
| `surface` | `#FFFFFF` | `#111827` | Cards, panels, navigation |
| `surface-subtle` | `#F1F5F9` | `#1A2234` | Grouped regions and input backgrounds |
| `border` | `#E2E8F0` | `#263348` | Visible boundaries |
| `text` | `#0F172A` | `#F8FAFC` | Primary text |
| `text-muted` | `#64748B` | `#94A3B8` | Secondary text |
| `primary` | `#2563EB` | `#3B82F6` | Primary actions, route progress |
| `primary-strong` | `#1D4ED8` | `#60A5FA` | Hover / high contrast |
| `accent` | `#EA580C` | `#FB923C` | Parcel / delivery action accent |
| `success` | `#16A34A` | `#22C55E` | Delivered / verified success |
| `warning` | `#CA8A04` | `#FACC15` | Awaiting pickup / attention / return |
| `danger` | `#DC2626` | `#F87171` | Failed delivery / destructive confirmation |
| `info` | `#0284C7` | `#38BDF8` | Informational status |
| `glass` | `rgba(255,255,255,0.85)` | `rgba(17,24,39,0.85)` | Backdrop blur headers and modals |

Status badges pair color with an icon and readable status text. Live journeys (`InTransit`, `OutForDelivery`) feature animated pulsing indicators.

## Typography

- **Headings & Display**: `Plus Jakarta Sans`, sans-serif (weights 600, 700, 800)
- **Body & Controls**: `Inter`, sans-serif (weights 400, 500, 600)
- **Data, Identifiers & Codes**: `JetBrains Mono`, monospace (weights 500, 700, tabular figures)

Line length is capped near 68 characters for explanatory text. Tracking codes use uppercase bold monospace with expanded letter-spacing.

## Layout and spacing

Base unit: 4px. Allowed spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.
Application content max-width is 1440px; public reading content is 1200px.
Desktop sidebar is 272px with collapsible toggle and role indicator.

Breakpoints:
- `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1440px.
- 375px: single column, 16px gutters, bottom mobile navigation, stacked records.
- 768px: 24px gutters, tables become available, multi-column forms only for tightly related fields.
- 1024px: persistent sidebar, dashboard grids.
- 1440px: maximum operational density without stretching reading widths.

## State matrix

Every data surface implements:

| State | Required response |
|---|---|
| Loading | Geometry-matched skeleton, `aria-busy=true` |
| Empty | Specific explanation and relevant next action |
| Error | Concise message, retry action, no raw exception |
| Disabled | Reduced opacity, `disabled` attribute, `pointer-events-none` |
| Submitting | Spinner, action label changes, duplicate submission blocked |
| Success | Persistent result or polite status message |

## Pre-delivery checklist

- [x] All required routes render real API state.
- [x] Loading, empty, error, disabled, submitting, and success states verified.
- [x] Keyboard navigation and focus rings verified with WCAG 2.2 standards.
- [x] Contrast and non-color status meaning reviewed.
- [x] 375, 768, 1024, and 1440px layouts verified via automated browser testing.
- [x] Reduced-motion override implemented (`@media (prefers-reduced-motion: reduce)`).
- [x] Filters survive refresh through URL state.
- [x] Public tracking contains no private sender, courier, phone, street, or note data.
- [x] No fake map, payment, live vehicle, or external-post claims.
- [x] Production build, unit tests, and Playwright browser flows pass.
