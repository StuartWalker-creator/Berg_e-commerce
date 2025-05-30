const mongoose = require('mongoose');

const ShippingOptionSchema = new mongoose.Schema({
  name: String, // e.g., "Standard", "Express"
  description: String,
  cost: Number,
  deliveryTime: String, // e.g., "1-3 business days"
});

module.exports = mongoose.model('ShippingOption', ShippingOptionSchema);
