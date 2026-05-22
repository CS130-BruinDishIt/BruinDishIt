import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

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

await runUpdate();
console.log("Menus updated!");

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error." });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});