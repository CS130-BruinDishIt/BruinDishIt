import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cron from 'node-cron';

import { runUpdate } from './scripts/updateMenus.js';
import diningRoutes from './routes/dining.js';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

app.use("/api/dining", diningRoutes);

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB");

await runUpdate();  // Keep it here in case server crashes and restarts
console.log("Server startup menu update complete");

cron.schedule('0 7 * * *', async () => {
  await runUpdate();
  console.log("Cron job menu update complete");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});