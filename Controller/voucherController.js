const Voucher = require("../models/Voucher.Schema");
const Shop = require("../models/Supplier.Schema");
const NeedyIndividual = require("../models/NeedyIndividuals.Schema");
const User = require("../models/User.schema");
const SMSService = require("../Services/smsService"); // A custom SMS service

// Create a Voucher
const createVoucher = async (req, res) => {
  try {
    const { amount, needyIndividualId, shopId } = req.body;
    
    // Check if the needy individual exists and is verified
    const needyIndividual = await NeedyIndividual.findById(needyIndividualId);
    if (!needyIndividual || !needyIndividual.isVerified) {
      return res.status(400).json({ error: "Needy individual is not verified" });
    }

    // Check if the shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    // Create the voucher
    const voucher = new Voucher({
      amount,
      needyIndividual: needyIndividualId,
      shop: shopId,
      donorId: res.locals.userId, // The donor is taken from the logged-in user
    });
    
    await voucher.save();

    // Send voucher details to the needy individual via SMS
    const message = `You have received a voucher worth ${amount} for use at ${shop.name}. Please visit the shop to redeem.`;
    await SMSService.sendSMS(needyIndividual.phone, message);

    // Notify the shopkeeper of the new voucher
    const shopkeeper = shop.owner;
    const notificationMessage = `New voucher of ${amount} assigned to your shop for ${needyIndividual.name}.`;
    // Send notification to the shopkeeper (this can be a dashboard notification or email, depending on your system)
    await SMSService.sendSMS(shopkeeper.phone, notificationMessage);

    res.status(201).json({ message: "Voucher created successfully", voucher });
  } catch (error) {
    console.error("Error creating voucher:", error);
    res.status(500).json({ error: "Error creating voucher", details: error.message });
  }
};

// Update Voucher Status (Redeemed)
const updateVoucherStatus = async (req, res) => {
  try {
    const { voucherId, status } = req.body;

    if (!["Pending", "Received"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    // Only the admin or the shopkeeper can update the status to 'Received'
    const shop = await Shop.findById(voucher.shop);
    if (status === "Received" && (res.locals.userId !== shop.owner.toString())) {
      return res.status(403).json({ error: "Only the shopkeeper can mark the voucher as received" });
    }

    voucher.status = status;
    await voucher.save();

    res.status(200).json({ message: "Voucher status updated", voucher });
  } catch (error) {
    console.error("Error updating voucher status:", error);
    res.status(500).json({ error: "Error updating voucher status", details: error.message });
  }
};

// Track Voucher History (for Admin & Shopkeeper)
const trackVoucherHistory = async (req, res) => {
  try {
    const vouchers = await Voucher.find({});

    if (!vouchers || vouchers.length === 0) {
      return res.status(404).json({ error: "No vouchers found" });
    }

    res.status(200).json({ vouchers });
  } catch (error) {
    console.error("Error fetching voucher history:", error);
    res.status(500).json({ error: "Error fetching voucher history", details: error.message });
  }
};

module.exports = { createVoucher, updateVoucherStatus, trackVoucherHistory };
