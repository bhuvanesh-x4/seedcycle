// ============================================================
// Feature 4: Weather-Based Seed Planting Guide
// Add to: client/src/pages/WeatherGuide.jsx
// Add route: { path: "/weather", element: <WeatherGuide /> }
// ============================================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../app/api";
import {
  CloudSun, Droplets, Wind, Thermometer, Sprout,
  MapPin, Loader2, RefreshCw, Clock
} from "lucide-react";
import PageShell from "../components/layout/PageShell";

export default function WeatherGuide() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [manualCity, setManualCity] = useState("");

  // Auto-detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          // Default to Bangalore if denied
          setLocation({ lat: 12.9716, lon: 77.5946 });
        }
      );
    }
  }, []);

  // Fetch planting guide when location is available
  useEffect(() => {
    if (location) fetchGuide();
  }, [location]);

  const fetchGuide = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/weather/planting-guide", {
        params: { lat: location.lat, lon: location.lon },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-emerald-300 flex items-center justify-center gap-3">
              <Sprout className="w-10 h-10" />
              Seed Planting Guide
            </h1>
            <p className="text-green-400/70 mt-2 text-lg">
              Weather-based recommendations for what to plant today
            </p>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="ml-3 text-green-300">Fetching weather data...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center text-red-300">
              {error}
              <button onClick={fetchGuide} className="ml-4 underline hover:text-red-200">
                Retry
              </button>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Weather Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-800/30 backdrop-blur-sm border border-green-700/40 rounded-2xl p-6 mb-8"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-green-300">
                      <MapPin className="w-5 h-5" />
                      <span className="text-xl font-semibold">
                        {data.weather.city}, {data.weather.country}
                      </span>
                    </div>
                    <p className="text-green-400/60 mt-1 capitalize">
                      {data.weather.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <Thermometer className="w-6 h-6 text-orange-400 mx-auto" />
                      <p className="text-3xl font-bold text-white">{data.weather.temp}°C</p>
                      <p className="text-xs text-green-400/60">
                        Feels {data.weather.feels_like}°C
                      </p>
                    </div>
                    <div className="text-center">
                      <Droplets className="w-6 h-6 text-blue-400 mx-auto" />
                      <p className="text-2xl font-semibold text-white">
                        {data.weather.humidity}%
                      </p>
                      <p className="text-xs text-green-400/60">Humidity</p>
                    </div>
                    <div className="text-center">
                      <Wind className="w-6 h-6 text-cyan-400 mx-auto" />
                      <p className="text-2xl font-semibold text-white">
                        {data.weather.wind_speed} km/h
                      </p>
                      <p className="text-xs text-green-400/60">Wind</p>
                    </div>
                  </div>
                </div>

                {/* Refresh button */}
                <button
                  onClick={fetchGuide}
                  className="mt-4 flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </motion.div>

              {/* Season Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <span className="inline-block bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-6 py-2 rounded-full text-lg font-medium">
                  {data.season.label} — {data.season.range}
                </span>
              </motion.div>

              {/* Planting Advice */}
              {data.advice.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mb-8"
                >
                  <h3 className="text-yellow-300 font-semibold mb-2">
                    🌱 Today's Planting Advice
                  </h3>
                  <ul className="space-y-1">
                    {data.advice.map((tip, i) => (
                      <li key={i} className="text-yellow-200/80 text-sm">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Seed Recommendations Grid */}
              <h2 className="text-2xl font-bold text-emerald-300 mb-4">
                Recommended Seeds to Plant Now
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {data.season.seeds.map((seed, i) => (
                  <motion.div
                    key={seed.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-green-800/20 backdrop-blur-sm border border-green-700/30 rounded-xl p-5 hover:border-emerald-500/50 transition group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{seed.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition">
                          {seed.name}
                        </h3>
                        <div className="flex items-center gap-1 text-green-400/60 text-sm mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{seed.days} days to harvest</span>
                        </div>
                        <p className="text-green-300/70 text-sm mt-2">{seed.tip}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
