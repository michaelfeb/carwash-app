# Dashboard UI Enhancement

**Status**: Draft
**Version**: 1.0

---

## Overview

Enhance the main dashboard page and its chart/stats components with a modern warm-blue design system, interactive charts, improved visual hierarchy, and polished micro-interactions. The goal is to transform the current flat, generic SaaS look into a visually rich, brand-consistent operations dashboard for a carwash business.

---

## Background

The current dashboard (`resources/js/pages/dashboard.tsx`) is functional but visually undifferentiated. Stats cards use a uniform gray icon with no color hierarchy. The pie chart uses a rainbow palette unrelated to the product brand. The revenue area chart fills with a generic CSS variable color. The table has no hover state or gradient header. There is no visual anchor on the page — all sections look the same weight. The owner needs a dashboard that communicates business health at a glance and feels premium.

---

## User Story

- As an **owner**, I want a visually polished dashboard with interactive charts and clear visual hierarchy, so that I can quickly understand the health of my carwash business at a glance.

---

## Goals

1. Apply a warm blue-indigo color theme consistently across all dashboard components.
2. Make the service pie chart interactive — click to explode a slice and update the center label.
3. Upgrade the revenue area chart with richer visuals and an enhanced tooltip.
4. Improve stats cards with colored icon bubbles and hover lift animations.
5. Upgrade the recent transactions table with a gradient header and row hover states.
6. Add visual hierarchy anchors to the page header and section titles.

---

## Functional Requirements

### Endpoint (if applicable)

_Not applicable_ — this is a pure frontend visual enhancement. No API changes.

### Component: `dashboard.tsx`

- Page header upgraded to include a gradient accent text or decorative element.
- Section spacing increased to `space-y-8` for better breathing room.
- Recent transactions table: header row uses a dark blue-to-indigo gradient with white uppercase text.
- Table rows: alternating stripe (`white` / `blue-50`), hover state `hover:bg-blue-50 cursor-pointer`.
- "Lihat semua" link replaced with a styled button-link with arrow icon.
- Empty state: structured block with icon, heading, and CTA button.

### Component: `stats-card.tsx`

- Each card type gets a colored icon bubble (`bg-{color}-100` circle with `text-{color}-600` icon).
- Hover lift animation: `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`.
- Subtle left-border or top-border accent stripe per card, mapped to warm blue tones.
- Stats card icon size increased to `h-5 w-5` for better visual weight.

### Component: `revenue-area-chart.tsx`

- Gradient fill changed from `--primary` generic variable to an explicit warm blue-indigo gradient: `#2563eb` → `#4f46e5` → transparent.
- Area stroke color: `#2563eb` (blue-600).
- Active dot: pulsing ring effect using `activeDot` with a slightly larger hit area.
- Tooltip enhanced: shows formatted date label, rupiah value bold, transaction count, and a small trend arrow icon comparing to previous day if data allows (or omit trend if data structure doesn't support it — do not invent data).
- Summary tiles inside card header (total revenue + total transactions) styled as accent stat boxes.

### Component: `service-pie-chart.tsx`

- **Color palette**: Replace rainbow COLORS with a warm blue-indigo family:
  `['#1d4ed8', '#3b82f6', '#6366f1', '#818cf8', '#93c5fd', '#bfdbfe', '#c7d2fe', '#ddd6fe']`
- **Click interaction**: Implement `activeIndex` state (number | null). Clicking a slice sets `activeIndex`. Clicking the same slice again deselects (sets to null).
- **Explode on active**: Active slice uses `outerRadius={96}` (vs normal `outerRadius={86}`), achieved via a custom `renderCustomizedShape` or by mapping `outerRadius` per cell.
- **Sibling fade**: Inactive slices get `opacity={0.45}` when another slice is active.
- **Center donut label**: When no slice selected, shows total count + "transaksi". When a slice is selected, shows the slice name (truncated if long) + its count.
- **Hover state**: `cursor: pointer` on all slices. `onMouseEnter` can set a separate `hoverIndex` for a lighter highlight.
- **Legend**: Each row shows color dot, service name, count, and percentage of total as a small muted badge.
- **Deselect**: Clicking outside the pie (on the card body) or clicking the same active slice resets to null.

---

## Non-Functional Requirements

- No changes to data fetching, props interfaces, or backend calls.
- All color values must use Tailwind classes or inline style — no new CSS files.
- Must remain fully functional in both mobile and desktop viewport.
- No new npm packages — use only existing Recharts and Lucide React.

---

## Workflow / Mechanism

1. User opens `/dashboard`.
2. Stats cards render with colored icon bubbles; hover lifts the card slightly.
3. Revenue chart renders with warm blue gradient fill; hovering a data point shows an enhanced tooltip.
4. Pie chart renders with warm blue palette; user can click any slice to explode it and see its details in the center label; clicking again or clicking another slice switches focus.
5. Transactions table renders with gradient header; rows have hover blue highlight.

---

## Impacted Components

### New Files

_Not applicable_ — no new files needed.

### Modified Files

| File | Change |
|------|--------|
| `resources/js/pages/dashboard.tsx` | Page header accent, section spacing, table gradient header, row hover, empty state, "Lihat semua" button-link |
| `resources/js/components/app/stats-card.tsx` | Colored icon bubble, hover lift, accent border |
| `resources/js/components/app/revenue-area-chart.tsx` | Warm blue gradient fill, enhanced tooltip, styled summary tiles |
| `resources/js/components/app/service-pie-chart.tsx` | Blue-indigo palette, click-to-explode interaction, active center label, percentage legend |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| `serviceChart` data is empty | Pie chart shows structured empty state (icon + message), no crash |
| `revenueChart` data is empty | Revenue chart shows empty state message, no crash |
| `recentTransactions` is empty | Shows structured empty state block with CTA |
| Service name is very long | Legend truncates with `truncate` class, tooltip shows full name |
| Only one service type in pie | Single slice fills full donut; click still works |
| Clicking the active slice again | Deselects — center label returns to total count |

---

## Open Questions

- _None — this is a pure visual enhancement; all decisions resolved in the planning session._

---

## Notes

- Do not use `colorScheme="navy"` — this project uses Tailwind, not Chakra UI.
- Warm blue palette anchor: `blue-600` (#2563eb) as primary, `indigo-600` (#4f46e5) as secondary, `blue-100`/`blue-50` as surface tones.
- Recharts `Cell` accepts `opacity` prop directly for slice fading.
- For pie explode effect, use `outerRadius` per `Cell` — Recharts supports different radii per cell.
- Keep all Indonesian text labels (`transaksi`, `Dicuci`, `Selesai`, etc.) unchanged.
- `formatRupiah` and `formatRupiahFull` already exist — reuse them, do not inline number formatting.

---

## API Reference

_Not applicable_ — no API endpoints involved.

---

## Version History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-05-14 | Frontend Team | Initial PRD — Dashboard UI Enhancement |
