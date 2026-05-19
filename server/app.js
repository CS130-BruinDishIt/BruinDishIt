import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

import { runUpdate } from './scripts/updateMenus.js';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB");

await runUpdate();
console.log("✅ Menus updated!");

app.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});