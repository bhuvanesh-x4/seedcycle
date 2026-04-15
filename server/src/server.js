import app from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

await connectDb();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 SeedCycle API running on http://localhost:${env.port}`);
});
