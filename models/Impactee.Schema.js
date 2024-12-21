const mongoose = require("mongoose");

const impacteeRequestSchema = mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  impacteeDetails: {
    name: String,
    cnic: String,
    address: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ImpacteeRequest = mongoose.model("ImpacteeRequest", impacteeRequestSchema);
module.exports = ImpacteeRequest;
