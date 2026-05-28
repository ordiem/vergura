# Vergura Investment

> Research-led capital intelligence.

A premium visual identity and website for **Vergura Investment** — an institutional
investment research and intelligence platform with a private, CMS-driven module for
publishing market reports, macro analysis, asset theses, and strategic insight.

Dark, cinematic, editorial finance aesthetic: Swiss precision, macro intelligence,
multi-asset sophistication, and institutional restraint.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19.2)
- **Tailwind CSS v4** (`@theme` design tokens, no config file)
- **TypeScript** (strict)
- **next/font** — self-hosted Fraunces (editorial serif), Inter (UI sans),
  IBM Plex Mono (financial metadata)
- Hand-built SVG chart system — no charting dependency

## Design system

| Token group | Values |
| --- | --- |
| Core | Ink `#050505`, Charcoal `#0D0D0D`, Graphite `#171717`, Ivory `#F4F1EA`, Stone `#B8B3A8`, Silver `#8E8E8E` |
| Accent | Forest `#0E2A1F`, Antique Gold `#BFA46A`, Champagne `#D8C9A3`, Bronze `#8C6F3F` |

Design tokens live in `app/globals.css` (`@theme`) and map to Tailwind utilities
(`bg-ink`, `text-gold`, `border-line`, `font-serif`, …).

## Routes

### Public site — `app/(site)`
- `/` — Hero, latest research, six investment pillars, data/visual systems,
  CMS preview, and the Vergura approach.
- `/research` — filterable intelligence library (search, asset-class + category
  filters, featured + most-read).
- `/research/[slug]` — long-form report page: executive summary, key takeaways,
  body with pull quotes and figures, risk disclosure, related research,
  download/copy actions. Statically generated per report.

### Research platform (CMS) — `app/platform`
A private publishing cockpit with its own sidebar shell.
- `/platform` — dashboard: pipeline, stats, readership, publishing calendar.
- `/platform/library` — full report table with status tabs (`?status=` drives the
  Drafts / Scheduled / Published sidebar links).
- `/platform/new` — interactive draft editor with metadata, release controls,
  visibility toggle, compliance field, and version history.
- `/platform/authors`, `/platform/asset-classes`, `/platform/disclosures`,
  `/platform/analytics`.

All research content is modelled in [`lib/content.ts`](lib/content.ts).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000  (Turbopack, outputs to .next/dev)
npm run build    # production build
npm run start    # serve the production build
```

> **Note:** This project targets a modified Next.js 16. Before changing framework
> APIs, read the bundled guides in `node_modules/next/dist/docs/` — see
> [`AGENTS.md`](AGENTS.md).

## Notes

- `params` and `searchParams` are **async** (Next 16) and awaited in
  `/research/[slug]` and the `searchParams`-driven pages.
- Fonts are fetched and self-hosted at build time via `next/font/google`.
- Motion is restrained: scroll reveals, chart line-drawing, and refined hover
  states only — all respecting `prefers-reduced-motion`.
