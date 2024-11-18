const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
  {
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    amount: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
    receiptImage: { type: String },  // URL to the image if uploaded
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
