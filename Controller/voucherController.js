const Voucher = require("../models/Voucher.Schema");
const Shop = require("../models/Supplier.Schema");
const NeedyIndividual = require("../models/NeedyIndividuals.Schema");
const User = require("../models/User.schema");
const SMSService = require("../Services/smsService"); // A custom SMS service

// Create a Voucher (Only Donors can create)
const createVoucher = async (req, res) => {
  try {
    const { amount, needyIndividualId, shopId } = req.body;

    // Get user ID from the token (assumes userId is set in `res.locals` via middleware)
    const userId = res.locals.userId;

    // Verify user role (only donors can create vouchers)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ error: "Only donors are allowed to create vouchers" });
    }

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
      donorId: userId, // Donor ID from logged-in user
      status: "Pending", // Default status
    });

    await voucher.save();

    
    res.status(201).json({ message: "Voucher created successfully", voucher });
  } catch (error) {
    console.error("Error creating voucher:", error);
    res.status(500).json({ error: "Error creating voucher", details: error.message });
  }
};

// Update Voucher Status (Shopkeeper or Admin)
const updateVoucherStatus = async (req, res) => {
  try {
    const { voucherId, status } = req.body;
    const userId = res.locals.userId;

    if (!["Pending", "Received"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    // Verify that only the shopkeeper or admin can update the status
    const shop = await Shop.findById(voucher.shop);
    const user = await User.findById(userId);
    const isShopkeeper = shop && shop.owner.toString() === userId;
    const isAdmin = user && user.role === "Admin";

    if (status === "Received" && !isShopkeeper && !isAdmin) {
      return res.status(403).json({
        error: "Only the shopkeeper or an admin can mark the voucher as received",
      });
    }

    voucher.status = status;
    await voucher.save();

    res.status(200).json({ message: "Voucher status updated successfully", voucher });
  } catch (error) {
    console.error("Error updating voucher status:", error);
    res.status(500).json({ error: "Error updating voucher status", details: error.message });
  }
};

// Track Voucher History (For Admin and Shopkeepers)
const trackVoucherHistory = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const user = await User.findById(userId);

    // Allow Admins to see all vouchers, Shopkeepers see only their shop's vouchers
    let query = {};
    if (user.role === "Shopkeeper") {
      const shop = await Shop.findOne({ owner: userId });
      if (!shop) {
        return res.status(403).json({ error: "You are not associated with any shop" });
      }
      query.shop = shop._id;
    } else if (user.role !== "Admin") {
      return res.status(403).json({ error: "Unauthorized access to voucher history" });
    }

    const vouchers = await Voucher.find(query)
      .populate("needyIndividual", "name phone")
      .populate("shop", "name")
      .populate("donorId", "name email");

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
