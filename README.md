# Apex Transit — RCS Bay Area Transit Chatbot

A Bay Area transit chatbot that runs over RCS. Riders share their location through RCS, see the closest stops across BART, Muni, AC Transit, Caltrain, Golden Gate Transit, and other 511.org agencies, then pull real-time arrivals — all from inside the messages app.

> **Live guide:** https://pinnacle.sh/samples/apex-transit

https://github.com/user-attachments/assets/074fb330-293a-4e9d-af82-c8757de56f92

> Note: the visuals in this demo recording have since been refreshed with sharper brand assets. The conversation flow is identical to what you'll get from a fresh clone.

## What's inside

- Find nearby stops by sharing location through RCS
- Real-time arrivals from the 511.org StopMonitoring API
- Coverage across BART, Muni, AC Transit, Caltrain, Golden Gate Transit, and more
- Local SQLite GTFS database for nearby-stop lookup
- Per-rider recently-viewed stops and routes

## Prerequisites

- Node.js 18+
- A Pinnacle account — [sign up](https://app.pinnacle.sh/auth/sign-up)
- An RCS [test agent](https://docs.pinnacle.sh/guides/branded-test-agents) for development
- A Pinnacle [API key](https://app.pinnacle.sh/dashboard/development/api-keys) and [webhook signing secret](https://app.pinnacle.sh/dashboard/development/webhooks)
- A free 511.org API key — https://511.org/open-data/token
- Optional: a Mapbox API key for richer geocoding

## Quick start

```bash
git clone https://github.com/pinnacle-samples/Apex-Transit
cd Apex-Transit
npm install
cp .env.example .env
# fill in PINNACLE_*, API_511_KEY, MAPBOX_API_KEY (optional)

# Import the GTFS database (one-time, slow)
npm run update-db

npm run dev
```

Expose your webhook with [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then in the [Pinnacle Webhooks dashboard](https://app.pinnacle.sh/dashboard/development/webhooks):

1. Add `https://<your-tunnel-domain>/webhook`
2. Attach it to your RCS agent
3. Copy the signing secret into `PINNACLE_SIGNING_SECRET`

Send `MENU` or `START` to your agent — you'll see Apex Transit's main menu with **Stops Near Me**, **Recently Viewed**, and **Help**. Tap **Stops Near Me** and share your location to see live arrivals.

## Environment variables

```env
PINNACLE_API_KEY=your_pinnacle_api_key_here
PINNACLE_AGENT_ID=your_agent_id_here
PINNACLE_SIGNING_SECRET=your_pinnacle_signing_secret_here
TEST_MODE=false
PORT=3000

# 511.org Open Data — required for real-time arrivals
API_511_KEY=your_511_api_key_here

# Mapbox API key — used for richer geocoding (optional)
MAPBOX_API_KEY=your_mapbox_api_key_here
```

## Project structure

```
Apex-Transit/
├── server.ts                   # Express bootstrap
├── router.ts                   # /webhook POST — dispatches by message type
├── update-db.sh                # GTFS importer (also runnable via `npm run update-db`)
├── handlers/
│   ├── index.ts                # Re-exports the three handlers below
│   ├── button.ts               # Trigger button handler
│   ├── location.ts             # Location-share handler
│   └── text.ts                 # Free-form text handler
├── cache/
│   ├── gtfsCache.ts            # SQLite reader
│   ├── import-gtfs.ts          # GTFS feed → SQLite importer
│   ├── schema.sql              # Stops / routes / agencies tables
│   └── gtfs.db                 # Generated SQLite DB (after import)
└── lib/
    ├── rcsClient.ts            # PinnacleClient instance
    ├── baseAgent.ts            # Shared send + typing helpers
    ├── typing.ts               # Fire-and-forget typing indicator
    ├── agent.ts                # Agent — recently viewed state + presentation
    └── transit/
        ├── arrivals.ts         # 511.org StopMonitoring fetcher
        ├── nearbyStops.ts      # Geo lookup over GTFS DB
        ├── types.ts            # ArrivalInfo, StopData, AGENCY_NAMES
        └── util.ts             # Distance, formatting helpers
```

## Routing by message type

Unlike the other samples, `router.ts` doesn't switch on a trigger action — it dispatches by RCS message type:

- `RCS_BUTTON_DATA` (trigger) → `handleButtonClick`
- `RCS_LOCATION_DATA` → `handleLocation`
- `RCS_TEXT` → `handleTextMessage`

This makes location sharing a first-class flow rather than a special case inside a giant switch statement.

## How nearby-stop lookup works

When a user shares their location, `handlers/location.ts` calls `findNearestStops(lat, lng)` which runs a haversine query over the SQLite stops table. For each result, it calls the 511.org StopMonitoring API to fetch the routes that actually serve that stop right now (instead of all routes that *could* serve it).

The result is a small set of cards with current arrivals — usually 3 to 5 stops, ranked by walking distance.

## Customize coverage

`AGENCY_NAMES` in `lib/transit/types.ts` is the allowlist of supported agencies. Add a new agency, re-run `npm run update-db`, and the next location share picks it up.

## Going to production

- Set `TEST_MODE=false` and submit your agent for [carrier approval](https://docs.pinnacle.sh/guides/campaigns/rcs)
- Move `gtfs.db` to a managed Postgres or MySQL instance with PostGIS for a real geo index
- Schedule `npm run update-db` as a nightly cron so the stop catalog stays fresh
- Add proactive arrival alerts by storing favorite stops per rider and pushing updates from a worker

## Resources

- **Live guide:** https://pinnacle.sh/samples/apex-transit
- **Pinnacle docs:** https://docs.pinnacle.sh/documentation/introduction
- **511.org open data:** https://511.org/open-data
- **Support:** founders@trypinnacle.app
