import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import seedsRoutes from "./routes/seeds.routes.js";
import exchangesRoutes from "./routes/exchanges.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import companyRoutes from "./routes/company.routes.js";
import passwordRoutes from "./routes/password.routes.js";
import weatherRoutes from "./routes/weather.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: env.corsOrigin,
  credentials: true
}));

// Static uploads (local MVP)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));



app.get("/api/health", (req, res) => res.json({ ok: true, name: "SeedCycle API" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/seeds", seedsRoutes);
app.use("/api/exchanges", exchangesRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
