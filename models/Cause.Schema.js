const mongoose = require('mongoose');

const causeSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    goal: { type: Number, required: true },
    timeline: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cause', causeSchema);  // Register the model with name "Cause"
