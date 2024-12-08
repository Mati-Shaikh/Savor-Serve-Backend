const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Use UUID for generating unique trackingId

const voucherSchema = mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: function () {
      return this.type === "Shop"; // Only required if the type is "Shop"
    },
  },
  needyIndividual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NeedyIndividual",
    required: function () {
      return this.type === "Individual"; // Only required if the type is "Individual"
    },
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // The donor who creates the voucher
  },
  status: {
    type: String,
    enum: ["Pending", "Received","Redeemed"],
    default: "Pending", // Status of the voucher
  },
  type: {
    type: String,
    enum: ["Individual", "needy"],
    required: true, // Ensure voucher type is specified
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  trackingId: {
    type: String,
    unique: true, // Ensure trackingId is unique
    default: function () {
      return uuidv4(); // Automatically generate a unique trackingId using UUID
    },
  },
});

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
