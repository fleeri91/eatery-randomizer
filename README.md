# Whim

Whim is a small web app for people who can't decide where to eat. Set a
location, tune a few filters, and let it pick a nearby café, restaurant, bar,
or bakery at random. Don't like the pick? Reroll, or block it and try again.

## Features

- **Location picker** — use the browser's geolocation ("Near me") or search
  for a city via Google Places Autocomplete.
- **Filters** — category (café / restaurant / bar / bakery), minimum rating,
  price level, and search radius (up to 3 km).
- **Randomizer** — picks a random place from whatever currently matches the
  filters, avoids repeating a pick until the pool is exhausted, and lets you
  permanently block a result ("Not this one") so it's excluded from future
  draws for the session.
- **Reveal animation** — a slot-machine-style reel spins through candidate
  names before landing on the pick (skipped automatically when the OS
  `prefers-reduced-motion` setting is on).
- **Result card** — shows rating, price, address, and a static Google Map
  preview (mobile), with one-tap directions from the chosen origin.
- **Responsive layouts** — a single-column mobile flow and a two-pane desktop
  wizard (filters panel + result stage), switched at the `1024px` breakpoint.
- **Empty-state recovery** — if filters are too strict, suggests which one to
  loosen (widen radius, drop rating, clear price) instead of a dead end.

## Tech stack

| Concern | Library |
|---|---|
| UI framework | React 19 + TypeScript, built with Vite |
| Styling | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) components (`base-nova` style) |
| Client/server state | [TanStack Query](https://tanstack.com/query) for the Places API call, [Zustand](https://github.com/pmndrs/zustand) for local filter/location state |
| Maps & places data | Google Maps JavaScript API (`@react-google-maps/api`) + Google Places API (New) — Nearby Search, Autocomplete, Place Details |
| Icons / fonts | lucide-react; Bricolage Grotesque (headings) and Hanken Grotesk (body) via Fontsource |

No backend — it's a static SPA that talks directly to Google's Places API
from the browser using a client-side API key.

## Getting started

Requires Node (or Bun — a `bun.lock` is checked in) and a Google Cloud
project with the **Places API (New)** and **Maps JavaScript API** enabled.

1. Install dependencies:
   ```bash
   npm install   # or: bun install
   ```
2. Create a `.env` file in the project root with your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```
   Restrict this key (HTTP referrers + the two APIs above) since it ships to
   the browser.
3. Run the dev server:
   ```bash
   npm run dev
   ```

Other scripts: `npm run build` (type-check + production build), `npm run
preview` (preview the build), `npm run lint`, `npm run prettier`.

## Project structure

```
src/
  App.tsx                  # top-level flow: filters → search → randomize → result
  main.tsx                 # entry point, wraps App with QueryClientProvider
  views/
    start-screen.tsx        # mobile "set location + filters" landing screen
  components/
    location-sheet.tsx      # bottom-sheet: geolocation or city autocomplete
    place-filter.tsx         # category / price / rating / radius controls
    reveal-stage.tsx         # slot-machine reveal animation
    result-card.tsx           # mobile full-screen result (with embedded map)
    desktop-result-card.tsx   # desktop result panel (no map)
    desktop-wizard.tsx        # desktop two-pane layout (filters | result)
    empty-state.tsx           # "no matches" screen with filter-loosening suggestions
    ui/                      # shadcn primitives (button, input, slider, ...)
  hooks/
    use-randomizer.ts        # pick/reroll/block logic, tracks seen & blocked ids
    use-media-query.ts       # matchMedia hook, used for the mobile/desktop split
  lib/
    api.ts                  # Google Places API calls (searchNearby, autocomplete, details)
    geo-location.ts          # browser geolocation wrapper
    randomizer.ts             # pure filter/pick helpers
    place-links.ts            # Google Maps deep links (directions, place info)
    queries.ts                # TanStack Query hook wrapping searchPlaces
    query-client.ts            # shared QueryClient config
  stores/
    filter-store.ts           # Zustand store: location + filter values
  types/
    google-places.ts          # shared types, category/price constants & labels
```

## How it works

1. **Location & filters** live in a Zustand store ([filter-store.ts](src/stores/filter-store.ts)),
   independent of whether the search has been "submitted" yet.
2. Submitting triggers [`useNearbyPlaces`](src/lib/queries.ts), a TanStack
   Query hook that calls the Places API `searchNearby` endpoint for up to 20
   places of the selected category within the chosen radius.
3. [`useRandomizer`](src/hooks/use-randomizer.ts) takes those raw results and:
   - filters them by minimum rating and price level (pure functions in
     [randomizer.ts](src/lib/randomizer.ts)),
   - excludes any place the user has blocked,
   - picks randomly from whatever's left, cycling through the full pool
     before a name can repeat, and resetting once every candidate has been
     seen.
4. [`RevealStage`](src/components/reveal-stage.tsx) animates a scrolling
   reel of candidate names before settling on the actual pick, then renders
   the result card.
5. On desktop (`≥1024px`, via [`useMediaQuery`](src/hooks/use-media-query.ts)),
   [`App.tsx`](src/App.tsx) renders [`DesktopWizard`](src/components/desktop-wizard.tsx)
   instead of the stacked mobile flow — same state and hooks, different layout.

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Used for Places Nearby Search, Autocomplete, Place Details, and rendering the embedded map on the mobile result card. |
