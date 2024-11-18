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
        title: { type: String, required: true },
        description: { type: String, required: true },
        goal: { type: Number, required: true },
        timeline: { type: Date, required: true },
      },
    ],
    packages: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        causeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cause" },  // Reference to Cause model
      },
    ],
    impactees: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        cnic: { type: String, unique: true, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGO", ngoSchema);
