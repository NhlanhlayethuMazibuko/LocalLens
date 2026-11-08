# LocalLens

**Find the best places around you on one map, with photos, ratings and directions, so you can decide where to go in seconds.**

LocalLens is a responsive web app for discovering restaurants, hotels and attractions nearby. A live map and a ranked list work side by side: tap a pin or a card and you get everything you need to decide, from photos and reviews to opening hours and directions.

## The problem

Finding somewhere good to eat, stay or visit usually means juggling a maps app, review sites and search results, and most travel sites are cluttered with ads and sponsored listings. It's hard to see, at a glance, which highly rated place is actually close by and open right now.

## The solution

One clean screen that answers "what's good near me?" in a few seconds:

- **Map and list in sync.** Every place is both a pin and a card. Selecting one highlights the other.
- **Decide fast.** Cards show a photo, star rating, review count, price level, distance and today's hours. The best match is featured at the top.
- **Everything to go.** The details view has full opening hours, phone, website, real reviews and one-tap directions.
- **Anywhere in the world.** Search any city, see the live weather there and save favourites.
- **Any screen.** Side-by-side on desktop, map plus bottom sheet on mobile, light and dark themes.

---

## Features

| | |
|---|---|
| Restaurants, hotels, attractions | Switch type; sort by top rated, nearest or name |
| Photos, ratings and reviews | From Google Places, with photographer credits |
| Place details | Full weekly hours, phone, website, editorial summary, up to 5 reviews |
| City search | Geocoding with Nominatim (OpenStreetMap) |
| Live weather | Current conditions at the map centre (Open-Meteo) |
| Saved places | Heart a place; remembered in the browser |
| Responsive | Desktop split view and mobile bottom sheet |
| Light and dark mode | Built on CSS custom properties |
| Free fallback mode | Runs on OpenStreetMap data with no API key at all |

---

## Tech stack

- **React 19** with function components and custom hooks
- **Vite** for development and builds
- **Google Maps JavaScript API** and **Places API (New)** via `@vis.gl/react-google-maps`
- **Leaflet** and **OpenStreetMap** for the keyless fallback map
- **Overpass API**, **Nominatim** and **Open-Meteo** for free place, search and weather data
- **Plain CSS** with design tokens (no UI framework)
- **Prettier** for consistent formatting
- **Figma** for the design system and screens, designed before writing code

---

## Engineering highlights

- **Two data sources, one interface.** Google Places and OpenStreetMap results are normalised into the same `place` shape, so every component works with either. The app picks the source at start-up based on whether an API key is present.
- **Cost-aware API usage.** Google searches are cached and only run automatically for a new area or a new type. Small map moves show a *Look around here* button instead of firing a paid request. Photos load lazily, and details are only fetched when a place is opened.
- **Resilient on flaky free servers.** The OpenStreetMap search asks a backup server if the first one is slow, uses whichever answers first, and cancels requests that are no longer needed (`AbortController`).
- **Accessible colour system.** Every text and background pair was checked against WCAG AA contrast in both light and dark themes. Forms, buttons and toggles have proper labels and focus states.
- **Safe with outside data.** Place names are escaped before being placed in map markers, and only `http(s)` links from map data are ever rendered.
- **Secrets stay out of Git.** The API key lives in `.env.local`, which is git-ignored.

---

## Run it locally

You need [Node.js](https://nodejs.org) (LTS).

```bash
git clone https://github.com/NhlanhlayethuMazibuko/LocalLens.git
cd LocalLens
npm install
npm run dev
```

Open http://localhost:5173.

**Without any setup, the app runs in free mode** on OpenStreetMap data, with no photos or ratings.

### Optional: turn on Google photos, ratings and reviews

1. In [Google Cloud](https://console.cloud.google.com), create a project and enable **Maps JavaScript API** and **Places API (New)**.
2. Create an API key and restrict it to `http://localhost:5173/*` and those two APIs.
3. Create a file called `.env.local` in the project folder:

   ```
   VITE_GOOGLE_MAPS_API_KEY=your-key-here
   ```

4. Restart `npm run dev`.


## What I'd build next

- A **Saved places** screen (favourites are already stored)
- An **Open now** filter
- **Shareable links** to a place or search area
- **Tests** for the data normalisation and hooks
- **Deploying** to a public URL

---

## About

Designed and built by **Nhlanhla Mazibuko**. Built with AI pair-programming (Claude) as a learning project. I directed the product and design decisions and reviewed and tested the code.


