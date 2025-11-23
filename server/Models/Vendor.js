const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serviceType: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      index: "2dsphere",
    },
  },
  isAvailable: { type: Boolean, default: false },
  socketId: { type: String },
});

module.exports = mongoose.model("Vendor", VendorSchema);
