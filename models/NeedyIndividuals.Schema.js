const mongoose = require("mongoose");

const needyIndividualSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId}, // Admin who created the record
    updatedBy: { type: mongoose.Schema.Types.ObjectId}, // Admin who last updated the record
  },
  { timestamps: true }
);

module.exports = mongoose.model("NeedyIndividual", needyIndividualSchema);
