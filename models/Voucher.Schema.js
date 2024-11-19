const mongoose = require("mongoose");

const voucherSchema = mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true, // The shop to which the voucher is assigned
  },
  needyIndividual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NeedyIndividual",
    required: true, // The needy individual who will redeem the voucher
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // The donor who creates the voucher
  },
  status: {
    type: String,
    enum: ["Pending", "Received"],
    default: "Pending", // Status of the voucher
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
