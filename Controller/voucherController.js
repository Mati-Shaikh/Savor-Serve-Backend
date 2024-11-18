const Voucher = require('../models/Voucher.Schema');

// Voucher Redemption
const redeemVoucher = async (req, res) => {
  try {
    const { trackingId } = req.body;

    // Find the voucher by trackingId
    const voucher = await Voucher.findOne({ trackingId });

    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    if (voucher.redeemed) return res.status(400).json({ error: 'Voucher already redeemed' });

    // Mark as redeemed
    voucher.redeemed = true;
    voucher.redeemedAt = new Date();
    voucher.beneficiaryId = res.locals.userId;  // assuming the user redeeming it is logged in

    await voucher.save();
    res.status(200).json({ message: 'Voucher redeemed successfully', voucher });
  } catch (error) {
    res.status(500).json({ error: 'Error redeeming voucher', details: error.message });
  }
};

module.exports = { redeemVoucher };
