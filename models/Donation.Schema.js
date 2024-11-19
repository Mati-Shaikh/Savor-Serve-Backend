const mongoose = require("mongoose");

const donationSchema = mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User schema
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  impacteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Could reference needy individuals
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NGO", // References the NGO schema (if donation is for an NGO)
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier", // References the Supplier schema (if donation is for a Supplier)
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

const Donation = mongoose.model("Donation", donationSchema);
module.exports = Donation;