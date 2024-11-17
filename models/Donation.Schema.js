const mongoose = require("mongoose");

const donationSchema = mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User schema
    required: true,
  },
  impacteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Could reference needy individuals
  },
  amount: {
    type: Number,
    required: true,
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
