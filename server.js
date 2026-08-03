// server.js - Nigeria GeoJSON API Server (states, LGAs & wards)
const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  corsMiddleware,
  delayMiddleware,
  loggerMiddleware,
  headersMiddleware,
} = require('./middlewares');

const DATA_DIR = path.join(__dirname, 'data');

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
}

// Load once at startup and keep in memory (data is static)
const states = loadJSON('states.json');
const lgas = loadJSON('lgas.json');
const wards = loadJSON('wards.json');
const lgasWithWards = loadJSON('lgas-with-wards.json');
const full = loadJSON('full.json');

const findState = (name) =>
  states.find((s) => s.toLowerCase() === String(name).toLowerCase());

const app = express();

app.use(corsMiddleware);
app.use(headersMiddleware);
app.use(loggerMiddleware);
app.use(delayMiddleware);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      states: '/api/states',
      lgas: '/api/lgas',
      lgasForState: '/api/states/:state/lgas',
      wards: '/api/wards',
      lgasWithWards: '/api/lgas-with-wards',
      full: '/api/full',
    },
  });
});

// GET /api/states - list of all state names
app.get('/api/states', (req, res) => {
  res.json(states);
});

// GET /api/states/:state/lgas - LGAs for a single state
app.get('/api/states/:state/lgas', (req, res) => {
  const state = findState(req.params.state);
  if (!state) return res.status(404).json({ error: `State '${req.params.state}' not found` });
  res.json(lgas[state]);
});

// GET /api/lgas - full state -> LGAs mapping, optional ?state= filter
app.get('/api/lgas', (req, res) => {
  const { state } = req.query;
  if (!state) return res.json(lgas);

  const matched = findState(state);
  if (!matched) return res.status(404).json({ error: `State '${state}' not found` });
  res.json({ [matched]: lgas[matched] });
});

// GET /api/wards - flat ward list, optional ?state=&lga=&search= filters
app.get('/api/wards', (req, res) => {
  const { state, lga, search } = req.query;
  let result = wards;

  if (state) {
    result = result.filter((w) => w.State.toLowerCase() === String(state).toLowerCase());
  }
  if (lga) {
    result = result.filter((w) => w.LGA.toLowerCase() === String(lga).toLowerCase());
  }
  if (search) {
    const term = String(search).toLowerCase();
    result = result.filter((w) => w.Ward.toLowerCase().includes(term));
  }

  res.json(result);
});

// GET /api/lgas-with-wards - nested state -> LGA -> wards, optional ?state=
app.get('/api/lgas-with-wards', (req, res) => {
  const { state } = req.query;
  if (!state) return res.json(lgasWithWards);

  const matched = findState(state);
  if (!matched) return res.status(404).json({ error: `State '${state}' not found` });
  res.json({ [matched]: lgasWithWards[matched] });
});

// GET /api/full - all-in-one dataset, optional ?state=
app.get('/api/full', (req, res) => {
  const { state } = req.query;
  if (!state) return res.json(full);

  const term = String(state).toLowerCase();
  const matched = full.find((entry) => entry.state.toLowerCase() === term);
  if (!matched) return res.status(404).json({ error: `State '${state}' not found` });
  res.json(matched);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🇳🇬 Nigeria GeoJSON API Server');
  console.log(`📡 Server is running on http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log('   GET  /api/states                       - List all states');
  console.log('   GET  /api/states/:state/lgas            - Get LGAs for a state');
  console.log('   GET  /api/lgas?state=                    - Get state -> LGAs mapping');
  console.log('   GET  /api/wards?state=&lga=&search=      - Get wards (with filtering)');
  console.log('   GET  /api/lgas-with-wards?state=         - Nested state -> LGA -> wards');
  console.log('   GET  /api/full?state=                    - All-in-one dataset');
  console.log('');
  console.log('💡 Use "npm run dev" for slower responses (realistic API simulation)');
});
