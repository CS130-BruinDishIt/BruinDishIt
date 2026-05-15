const mongoose = require('mongoose');


const dailyMenuSchema = new mongoose.Schema({
    date: { type: String, required: true },      // e.g., "2026-05-14"
    hallName: { type: String, required: true },  // e.g., "spice-kitchen"
    mealType: { type: String, required: true },  // e.g., "dinner"
    stations: [
      {
        stationName: { type: String, required: true }, // e.g., "Bruin Wok"
        items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
      }
    ]
  });
  
  const DailyMenu = mongoose.model('DailyMenu', dailyMenuSchema);
  
  module.exports = DailyMenu;