// ============================================================
// Feature 4: Weather-Based Seed Planting Guide (SaaS API)
// Add to: server/src/routes/weather.routes.js
// Register in app.js: app.use("/api/weather", weatherRoutes);
// Install: npm install axios (already installed)
// ============================================================

import { Router } from "express";
import axios from "axios";

const router = Router();

// ── Seed recommendations based on temperature ranges ──────
const SEED_DATABASE = {
  cool: {
    range: "10°C – 20°C",
    label: "Cool Season",
    seeds: [
      { name: "Spinach", icon: "🥬", days: "40-50", tip: "Thrives in cool weather, direct sow" },
      { name: "Lettuce", icon: "🥗", days: "30-60", tip: "Partial shade in warmer spots" },
      { name: "Peas", icon: "🫛", days: "55-70", tip: "Sow directly, no transplanting" },
      { name: "Carrots", icon: "🥕", days: "70-80", tip: "Loose soil, thin seedlings" },
      { name: "Broccoli", icon: "🥦", days: "60-90", tip: "Start indoors, transplant after 4 weeks" },
      { name: "Radish", icon: "🔴", days: "22-30", tip: "Fastest growing vegetable" },
    ],
  },
  warm: {
    range: "20°C – 30°C",
    label: "Warm Season",
    seeds: [
      { name: "Tomato", icon: "🍅", days: "60-85", tip: "Full sun, stake for support" },
      { name: "Cucumber", icon: "🥒", days: "50-70", tip: "Needs consistent moisture" },
      { name: "Beans", icon: "🫘", days: "50-60", tip: "Direct sow after last frost" },
      { name: "Pepper", icon: "🌶️", days: "60-90", tip: "Start indoors, warm soil needed" },
      { name: "Corn", icon: "🌽", days: "60-100", tip: "Plant in blocks for pollination" },
      { name: "Sunflower", icon: "🌻", days: "70-100", tip: "Full sun, deep roots" },
    ],
  },
  hot: {
    range: "30°C+",
    label: "Hot Season",
    seeds: [
      { name: "Okra", icon: "🟢", days: "50-65", tip: "Loves heat, harvest young" },
      { name: "Sweet Potato", icon: "🍠", days: "90-120", tip: "Needs long warm season" },
      { name: "Watermelon", icon: "🍉", days: "80-100", tip: "Space widely, deep watering" },
      { name: "Bitter Gourd", icon: "🥒", days: "55-65", tip: "Tropical vine, trellis recommended" },
      { name: "Chili Pepper", icon: "🌶️", days: "60-90", tip: "Full sun, regular harvesting" },
      { name: "Basil", icon: "🌿", days: "50-75", tip: "Pinch flowers for bushy growth" },
    ],
  },
  cold: {
    range: "Below 10°C",
    label: "Cold Season (Indoor)",
    seeds: [
      { name: "Microgreens", icon: "🌱", days: "7-14", tip: "Grow indoors on windowsill" },
      { name: "Garlic", icon: "🧄", days: "240+", tip: "Plant cloves now, harvest spring" },
      { name: "Onion Sets", icon: "🧅", days: "90-120", tip: "Cold hardy, plant in fall" },
      { name: "Kale", icon: "🥬", days: "55-75", tip: "Frost makes it sweeter!" },
      { name: "Herbs (Indoor)", icon: "🌿", days: "30-60", tip: "Basil, cilantro, parsley on windowsill" },
    ],
  },
};

function getSeasonCategory(tempC) {
  if (tempC < 10) return "cold";
  if (tempC < 20) return "cool";
  if (tempC < 30) return "warm";
  return "hot";
}

function getPlantingAdvice(weather) {
  const advice = [];
  if (weather.humidity > 70) {
    advice.push("💧 High humidity — watch for fungal diseases. Ensure good air circulation.");
  }
  if (weather.humidity < 30) {
    advice.push("🏜️ Low humidity — mulch soil to retain moisture. Water deeply.");
  }
  if (weather.wind_speed > 20) {
    advice.push("💨 Windy conditions — stake tall plants and use windbreaks.");
  }
  if (weather.description?.includes("rain")) {
    advice.push("🌧️ Rain expected — hold off on watering. Good time to transplant!");
  }
  if (weather.description?.includes("clear")) {
    advice.push("☀️ Clear skies — ideal for sowing seeds directly outdoors.");
  }
  return advice;
}

// ── GET /api/weather/planting-guide?lat=12.97&lon=77.59 ───
router.get("/planting-guide", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: "Latitude (lat) and Longitude (lon) are required",
      });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      return res.status(503).json({
        error: "Weather service not configured",
      });
    }

    // Fetch current weather from OpenWeatherMap
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: "metric",
        },
      }
    );

    const data = weatherRes.data;

    const weather = {
      city: data.name,
      country: data.sys?.country,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      description: data.weather[0]?.description,
      icon: data.weather[0]?.icon,
    };

    const season = getSeasonCategory(weather.temp);
    const recommendations = SEED_DATABASE[season];
    const advice = getPlantingAdvice(weather);

    res.json({
      weather,
      season: recommendations,
      advice,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Weather API error:", err.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

export default router;

// ============================================================
// REGISTER IN app.js:
//
// import weatherRoutes from "./routes/weather.routes.js";
// app.use("/api/weather", weatherRoutes);
// ============================================================
