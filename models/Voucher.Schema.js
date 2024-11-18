const mongoose = require('mongoose');

const voucherSchema = mongoose.Schema(
  {
    trackingId: { type: String, unique: true, required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    redeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date },
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // beneficiary who redeemed it
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voucher', voucherSchema);
