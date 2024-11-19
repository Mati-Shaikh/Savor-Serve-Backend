const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    bankDetails: {
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
      routingNumber: { type: String, required: true },
    },
    isStoreVisible: { type: Boolean, default: false },
    donations: [
      {
        donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ], // Track donations to the supplier
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
