const mongoose = require("mongoose");

const needyIndividualSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NGO", // Optional link to NGO
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NeedyIndividual = mongoose.model("NeedyIndividual", needyIndividualSchema);

module.exports = NeedyIndividual;
