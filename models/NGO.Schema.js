const mongoose = require("mongoose");
const Cause = require("./Cause.Schema");  // Import the Cause model

const ngoSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    registrationNumber: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String },
    causes: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Cause",  // Referencing the Cause model
      },
    ],
    impactees: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        cnic: { type: String, required: false, unique: true, sparse: true },
      },
    ],
    donations: [
      {
        donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ], 
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGO", ngoSchema);
