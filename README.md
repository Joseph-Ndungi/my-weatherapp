# Skyline — Weather App

A clean, creative weather application built with **Angular** (frontend) and **Node.js + Express** (backend), powered by the [WeatherAI API](https://weather-ai.co/docs).

**Live demo:** _[add your deployment URL here]_
**GitHub:** _[this repo]_

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Angular 17, TypeScript, SCSS |
| Backend | Node.js, Express |
| Weather data | WeatherAI API (v1) |
| Geocoding | OpenStreetMap Nominatim (free, no key needed) |
| Deployment | Render (backend) + Netlify (frontend) |

---

## What It Does

- **Auto-detects your location** via browser geolocation or IP fallback
- **City search** with live autocomplete (Nominatim)
- **Current conditions** — temperature, feels-like, wind, humidity, UV, visibility
- **AI Weather Brief** — Gemini-powered natural language summary from WeatherAI
- **Hourly forecast** — scrollable 24-hour strip with rain probability
- **7-day forecast** — relative temp range bars scaled across the week
- **Condition-aware background** — the UI colour shifts based on weather (clear, cloudy, rain, storm, night, fog, snow)

---

## Project Structure

```
weatherapp/
  backend/          Node.js + Express API proxy
    server.js       All routes + WeatherAI client
    .env.example    Environment variable template
    package.json

  frontend/         Angular 17 app
    src/
      app/
        services/
          weather.service.ts      HTTP calls to backend + Nominatim
        components/
          search-bar/             City search with debounce + autocomplete
          weather-hero/           Main temp display + stats + AI summary
          hourly-strip/           Scrollable hourly forecast
          daily-forecast/         7-day list with range bars
      environments/
        environment.ts            Points to localhost:3000 in dev
        environment.prod.ts       Points to /api in production
```

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/skyline-weather.git
cd skyline-weather
```

### 2. Backend

```bash
cd backend
npm install

# Copy the env template and fill in your WeatherAI key
cp .env.example .env
```

Edit `.env`:

```
WEATHER_API_KEY=wai_your_actual_key_here
PORT=3000
```

Start the server:

```bash
node server.js
```

Backend runs on `http://localhost:3000`.

### 3. Frontend

```bash
cd ../frontend
npm install
ng serve
```

Frontend runs on `http://localhost:4200`.

Open your browser at `http://localhost:4200`. The app will ask for location permission — allow it for auto-detection, or search for any city.

---

## Deployment

### Backend — Render

1. Push the `backend/` folder to a GitHub repo (or the full monorepo)
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `node server.js`
5. Add environment variable: `WEATHER_API_KEY` = your key
6. Copy the service URL (e.g. `https://skyline-api.onrender.com`)

### Frontend — Netlify

1. Update `src/environments/environment.prod.ts`:
   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://skyline-api.onrender.com/api'
   };
   ```
2. Build: `ng build --configuration=production`
3. Drag the `dist/frontend/browser` folder into [Netlify Drop](https://app.netlify.com/drop)
4. Or connect your GitHub repo and set:
   - **Build command:** `ng build --configuration=production`
   - **Publish directory:** `dist/frontend/browser`

---

## API Endpoints (Backend)

| Method | Path | Description |
|---|---|---|
| GET | `/api/weather` | Current + forecast + AI summary. Params: `lat`, `lon`, `days`, `units` |
| GET | `/api/current` | Current conditions only. Params: `lat`, `lon`, `units` |
| GET | `/api/hourly` | Hourly breakdown. Params: `lat`, `lon`, `units` |
| GET | `/api/geo` | Auto-detect location from caller IP |
| GET | `/api/usage` | WeatherAI quota usage |

The API key is held server-side only — never exposed to the browser.

---

## Design Notes

The UI takes cues from Apple Weather:

- Large, lightweight temperature typography (weight 200)
- Condition-driven background gradients (7 themes: clear day, clear night, cloudy, rain, storm, fog, snow)
- Subtle frosted-glass panels with low-opacity borders
- Scrollable hourly strip with the current hour highlighted
- 7-day range bars scaled relative to the week's global min/max (not absolute values)
- AI summary surfaced as a readable paragraph, not buried in metadata

No icon packs, no heavy component libraries — just Angular, SCSS, and SVG icons inline.
