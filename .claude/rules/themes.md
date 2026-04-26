# PropFlow Theme & Color Rules
# Load when working on any UI, styling, theme, or color-related task.

## Default — Midnight Pro (Dark, loaded by default)
Background #0D1B2A | Card/Surface #132337 | Border #1E3A5F
Primary Accent #1A56DB (Electric Blue) | Secondary #0EA5A0 (Teal)
Success #16A34A | Warning #D97706 | Danger #DC2626
Body text #E2E8F0 | Muted text #94A3B8 | Headings #FFFFFF

## Light Mode — Slate Professional
Background #F8FAFC | Surface #FFFFFF | Border #E2E8F0
Primary #1D4ED8 | Body #1E293B | Muted #64748B

## The 10 Themes (user-selectable, stored in localStorage as 'propflow-theme')
1. Midnight Pro (default dark) — navy + electric blue, sharp cards
2. Arctic Glass — dark slate + cyan, frosted glass effect
3. Warm Amber Dark — dark brown + gold, premium finance feel
4. Emerald Trust — dark green + emerald, real estate investment aesthetic
5. Slate Professional (default light) — white + royal blue, clean SaaS
6. Soft Cream Light — warm off-white + terracotta, approachable
7. Purple Depth — deep purple + violet, modern consumer
8. Steel Industrial — near-black + steel blue, no border radius, data-dense
9. Sunset Gradient — navy-to-teal sidebar + coral accent, marketing-ready
10. High Contrast Accessible — pure black + white + yellow, WCAG AAA

## Implementation Rules
All colors as CSS variables on :root. Body gets data-theme=[theme-name].
Auto theme: prefers-color-scheme dark → Theme 1, light → Theme 5.
User preference stored in localStorage key 'propflow-theme'.
Version string in footer: color: var(--muted-text), font-size: 12px.
Touch targets always min 44×44px regardless of theme.
