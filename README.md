# Nigeria GeoJSON Data API

This repository provides a lightweight Node.js/Express API for Nigeria’s administrative data, including states, local government areas (LGAs), and wards with coordinate information.

## What it contains

- Structured JSON datasets in the data folder
- A simple REST API for accessing the data
- Ready-to-use data for apps, maps, civic tech projects, and analytics

## Quick start

```bash
npm install
npm run dev
```

The server will start on http://localhost:3001.

## API endpoints

- GET /api/health
- GET /api/states
- GET /api/states/:state/lgas
- GET /api/lgas
- GET /api/wards
- GET /api/lgas-with-wards
- GET /api/full

## Data files

- states.json – list of Nigerian states
- lgas.json – mapping of states to LGAs
- wards.json – flat ward list with latitude and longitude
- lgas-with-wards.json – nested state/LGA/ward structure
- full.json – complete all-in-one dataset

## License

MIT
