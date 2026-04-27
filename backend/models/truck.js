const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  driver: { type: String, required: true },
  phone: { type: String, required: true },
  currentLocation: { type: String, required: true },
  route: [{ type: String }],
  operatingHours: { type: String, default: "11:00 AM - 7:00 PM" },
  image: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Truck', truckSchema);
