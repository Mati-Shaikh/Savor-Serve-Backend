const mongoose = require("mongoose");

const walletSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User schema
    required: true,
  },
  balance: {
    type: Number,
    default: 0, // Initial balance
    required: true,
  },
  transactions: [
    {
      type: {
        type: String, // e.g., "donation", "withdrawal"
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
