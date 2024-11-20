const mongoose = require('mongoose');

// Define the Package schema
const packageSchema = mongoose.Schema(
  {
    title: { type: String},
    description: { type: String},
    price: { type: Number },
  },
  { timestamps: true }
);

// Define the Cause schema with an embedded array of package objects
const causeSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    goal: { type: Number, required: true },
    timeline: { type: Date, required: true },
    packages: [packageSchema],  // Embed the array of package objects
  },
  { timestamps: true }
);

// Create and export the Cause model
const Cause = mongoose.model('Cause', causeSchema);

// Export the Cause model, no need to export Package separately if it's embedded
module.exports = { Cause };