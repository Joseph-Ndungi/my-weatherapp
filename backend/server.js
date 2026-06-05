const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = 'https://api.weather-ai.co';

app.use(cors());
app.use(express.json());

// Shared axios instance — API key lives here, never exposed to the frontend
const weatherClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.WEATHER_API_KEY}`,
  },
  timeout: 10000,
});

// Helper: forward query params and return data
async function fetchWeather(path, params) {
  const response = await weatherClient.get(path, { params });
  return response.data;
}

// GET /api/weather?lat=&lon=&days=&units=
// Returns current conditions + forecast + AI summary
app.get('/api/weather', async (req, res) => {
  const { lat, lon, days = 7, units = 'metric', lang = 'en' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const data = await fetchWeather('/v1/weather', { lat, lon, days, units, lang, ai: true });
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/current?lat=&lon=&units=
// Current conditions only
app.get('/api/current', async (req, res) => {
  const { lat, lon, units = 'metric' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const data = await fetchWeather('/v1/current', { lat, lon, units, ai: false });
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/hourly?lat=&lon=&units=
// Hourly breakdown
app.get('/api/hourly', async (req, res) => {
  const { lat, lon, units = 'metric' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const data = await fetchWeather('/v1/hourly', { lat, lon, units, ai: false });
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/geo
// Auto-detect location from caller IP
app.get('/api/geo', async (req, res) => {
  try {
    const data = await fetchWeather('/v1/weather-geo', { ip: 'auto', ai: false, days: 1 });
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/usage
// Pass through quota/usage stats
app.get('/api/usage', async (req, res) => {
  try {
    const data = await fetchWeather('/v1/usage', {});
    res.json(data);
  } catch (err) {
    handleError(err, res);
  }
});

// Centralised error handler
function handleError(err, res) {
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || err.response.statusText;
    return res.status(status).json({ error: message, status });
  }
  if (err.code === 'ECONNABORTED') {
    return res.status(504).json({ error: 'Weather API timed out. Try again.' });
  }
  console.error('Unexpected error:', err.message);
  res.status(500).json({ error: 'Something went wrong on our end.' });
}

app.listen(PORT, () => {
  console.log(`Weather backend running on http://localhost:${PORT}`);
});
