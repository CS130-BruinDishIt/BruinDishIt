const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  hallName: {
    type: String,
    required: true
  },

  averageRating: {
    type: Number,
    default: 0
  },

  dateAdded: {
    type: Date,
    default: Date.now
  }
});


menuItemSchema.index({ name: 1, hallName: 1 }, { unique: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;