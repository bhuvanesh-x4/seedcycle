# SeedCycle (MERN MVP) — Neon Nature + Leaflet + Multer

## 1) Setup
### MongoDB
Ensure MongoDB is running locally.

### Server
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Server runs on: `http://localhost:5000`

### Client
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Client runs on: `http://localhost:5173`

## 2) What’s included (MVP)
- JWT auth stored in **HTTP-only cookie**
- Seed listings CRUD + local image upload (Multer)
- Map discovery: `/api/seeds/near?lng=&lat=&radiusKm=` (Leaflet UI)
- Exchange request flow: request / inbox / outbox / approve / reject / cancel
- Community feed CRUD + photo upload
- Gamification points + badges
- Awwwards-style hero with parallax vines + magnetic button + route transitions

## 3) Notes
- In dev, cookie is `sameSite=lax`, `secure=false`.
- In production (HTTPS), set `NODE_ENV=production` and configure `CORS_ORIGIN` accordingly.
