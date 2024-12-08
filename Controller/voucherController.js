const Voucher = require("../models/Voucher.Schema");
const Shop = require("../models/Supplier.Schema");
const NeedyIndividual = require("../models/NeedyIndividuals.Schema");
const User = require("../models/User.schema");
const ImpacteeRequest = require('../models/Impactee.Schema');
const Wallet = require('../models/Wallet.Schema'); // Assuming this is the Wallet model for users
const createVoucher = async (req, res) => {
  try {
    const { amount } = req.body;
    const { impacteeId } = req.params; // Get impactee ID from URL params

    const userId = res.locals.userId;

    const user = await User.findById(userId);
    if (!user || user.Role !== 'Donor') {
      return res.status(403).json({ error: "Only donors are allowed to create vouchers" });
    }

    const impacteeRequest = await ImpacteeRequest.findOne({ _id: impacteeId, donorId: userId });
    if (!impacteeRequest || impacteeRequest.status !== "Approved") {
      return res.status(400).json({ error: "No approved impactee request found or you are not authorized" });
    }

    // Create the voucher
    const voucher = new Voucher({
      amount,
      needyIndividual: impacteeId, // Impactee is stored as 'needyIndividual' in the voucher
      donorId: userId, // Donor ID from logged-in user
      status: "Pending", // Default status
      type: "Individual" // Set type to "Individual" for impactee
    });

    await voucher.save();

    // Deduct the amount from the donor's wallet
    const donorWallet = await Wallet.findOne({ userId });
    if (!donorWallet || donorWallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance in donor's wallet" });
    }

    donorWallet.balance -= amount;
    donorWallet.transactions.push({ type: "debit", amount, date: new Date() });
    await donorWallet.save();

    // Add the amount to the impactee's wallet
    const impacteeWallet = await Wallet.findOne({ userId: impacteeId });
    if (!impacteeWallet) {
      // If the impactee does not have a wallet, create one
      const newImpacteeWallet = new Wallet({
        userId: impacteeId,
        balance: amount,
        transactions: [{ type: "credit", amount, date: new Date() }],
      });
      await newImpacteeWallet.save();
    } else {
      impacteeWallet.balance += amount;
      impacteeWallet.transactions.push({ type: "credit", amount, date: new Date() });
      await impacteeWallet.save();
    }

    res.status(201).json({ message: "Voucher created and amounts updated successfully", voucher });
  } catch (error) {
    console.error("Error creating voucher:", error);
    res.status(500).json({ error: "Error creating voucher", details: error.message });
  }
};
const createVoucherNeedy = async (req, res) => {
  try {
    const { amount } = req.body;
    const { needyId } = req.params; // Get needy individual's ID from URL params

    const userId = res.locals.userId;

    // Verify the user is a donor
    const user = await User.findById(userId);
    if (!user || user.Role !== "Donor") {
      return res.status(403).json({ error: "Only donors are allowed to create vouchers" });
    }

    // Find the needy individual by ID
    const needyIndividual = await NeedyIndividual.findById(needyId);
    if (!needyIndividual) {
      return res.status(404).json({ error: "Needy individual not found" });
    }

    // Ensure the donor has sufficient wallet balance
    const donorWallet = await Wallet.findOne({ userId });
    if (!donorWallet || donorWallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance in donor's wallet" });
    }

    // Create the voucher
    const voucher = new Voucher({
      amount,
      needyIndividual: needyId, // Associate voucher with the needy individual's ID
      donorId: userId, // Associate voucher with the donor's ID
      status: "Pending", // Default status
      type: "needy", // Type is "Individual" for needy
    });

    await voucher.save();

    // Deduct the amount from the donor's wallet
    donorWallet.balance -= amount;
    donorWallet.transactions.push({ type: "debit", amount, date: new Date() });
    await donorWallet.save();

    // Add the amount to the needy individual's wallet
    const needyWallet = await Wallet.findOne({ userId: needyId });
    if (!needyWallet) {
      // Create a wallet if the needy individual doesn't have one
      const newNeedyWallet = new Wallet({
        userId: needyId,
        balance: amount,
        transactions: [{ type: "credit", amount, date: new Date() }],
      });
      await newNeedyWallet.save();
    } else {
      needyWallet.balance += amount;
      needyWallet.transactions.push({ type: "credit", amount, date: new Date() });
      await needyWallet.save();
    }

    res.status(201).json({ message: "Voucher created and amounts updated successfully", voucher });
  } catch (error) {
    console.error("Error creating voucher:", error);
    res.status(500).json({ error: "Error creating voucher", details: error.message });
  }
};


const createVoucherForShop = async (req, res) => {
  try {
    const { amount } = req.body;
    const { shopId } = req.params;

    const userId = res.locals.userId;

    const user = await User.findById(userId);
    if (!user || user.Role !== 'Donor') {
      return res.status(403).json({ error: "Only donors are allowed to create vouchers" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    // Create the voucher
    const voucher = new Voucher({
      amount,
      shop: shopId, // Shop ID is stored as 'shop' in the voucher
      donorId: userId, // Donor ID from logged-in user
      status: "Pending", // Default status
      type: "Shop" // Set type to "Shop"
    });

    await voucher.save();

    // Deduct the amount from the donor's wallet
    const donorWallet = await Wallet.findOne({ userId });
    if (!donorWallet || donorWallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance in donor's wallet" });
    }

    donorWallet.balance -= amount;
    donorWallet.transactions.push({ type: "debit", amount, date: new Date() });
    await donorWallet.save();

    // Add the amount to the shop's wallet
    const shopWallet = await Wallet.findOne({ userId: shop.userId });
    if (!shopWallet) {
      // If the shop does not have a wallet, create one
      const newShopWallet = new Wallet({
        userId: shop.userId,
        balance: amount,
        transactions: [{ type: "credit", amount, date: new Date() }],
      });
      await newShopWallet.save();
    } else {
      shopWallet.balance += amount;
      shopWallet.transactions.push({ type: "credit", amount, date: new Date() });
      await shopWallet.save();
    }

    res.status(201).json({ message: "Voucher created for shop and amounts updated successfully", voucher });
  } catch (error) {
    console.error("Error creating voucher:", error);
    res.status(500).json({ error: "Error creating voucher", details: error.message });
  }
};

// Update Voucher Status (Shopkeeper or Admin)
const updateVoucherStatus = async (req, res) => {
  try {
    const { Id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Received"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    const voucher = await Voucher.findById(Id);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found." });
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
const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    if (!vouchers || vouchers.length === 0) {
      return res.status(404).json({ error: "No vouchers found." });
    }

    res.status(200).json({ message: "Vouchers fetched successfully", vouchers });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    res.status(500).json({ error: "Error fetching vouchers", details: error.message });
  }
};

const redeemVoucher = async (req, res) => {
  try {
    //const { Id } = req.params; // voucherId from URL params
    const { trackingId } = req.body; // trackingId from body, amount to update (if applicable)

    // Step 1: Find the voucher by trackingId
    const voucher = await Voucher.findOne({ trackingId });

    // Step 2: Check if voucher exists and its status is 'Received'
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found." });
    }

    if (voucher.status !== "Received") {
      return res.status(400).json({
        error: `Voucher status must be 'Received' to redeem, current status: ${voucher.status}`,
      });
    }

    // Step 3: Update status to 'Redeemed'
    voucher.status = "Redeemed";



    // Step 5: Save the updated voucher document
    await voucher.save();

    // Step 6: Send success response
    res.status(200).json({
      message: "Voucher successfully redeemed.",
      voucher,
    });

  } catch (error) {
    console.error("Error redeeming voucher:", error);
    res.status(500).json({
      error: "Error redeeming voucher",
      details: error.message,
    });
  }
};


module.exports = {createVoucherNeedy, createVoucher, createVoucherForShop, updateVoucherStatus, getAllVouchers,redeemVoucher };
