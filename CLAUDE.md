# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start Vite dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture Overview

This is a React SPA that displays Strava activity statistics and visualizations. It uses the Strava OAuth API for authentication and activity data.

### Key Data Flow

1. **Authentication**: OAuth flow handled by `AuthContext` + `stravaApi.js`
   - Login redirects to Strava OAuth
   - Callback page (`/callback`) exchanges code for tokens
   - Tokens stored in localStorage with prefix `strava_`

2. **Activity Loading**: Dashboard fetches activities via `stravaApi.getAllActivities()`
   - Pagination handled automatically (100 per page max)
   - 5-minute in-memory cache reduces API calls
   - API has rate limits: 200 req/15min, 2000 req/day

3. **Data Processing**: `utils/dataProcessing.js` transforms raw API data
   - `calculateAggregateStats()` - totals by type
   - `findPersonalRecords()` - longest distance, fastest pace, best efforts
   - `groupByWeek/Month/DayOfWeek/TimeOfDay()` - chart data

### Component Structure

- **Pages**: Login, Callback (OAuth), Dashboard (main view)
- **Charts**: TrendChart, FrequencyChart, DistributionChart, CalendarHeatmap (all use Recharts)
- **Layout**: Single layout component wraps authenticated pages

### Environment Variables

Required in `.env` (copy from `.env.example`):
```
VITE_STRAVA_CLIENT_ID=<your_client_id>
VITE_STRAVA_CLIENT_SECRET=<your_client_secret>
VITE_REDIRECT_URI=http://localhost:5173/callback
```

### Tech Stack

- React 19 + Vite 7
- React Router v7 for routing
- Axios for HTTP
- Recharts for visualizations
- date-fns for date utilities
