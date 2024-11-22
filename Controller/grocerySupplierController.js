const Supplier = require("../models/Supplier.Schema");
const Voucher = require("../models/Voucher.Schema");
const Transaction = require("../models/Transaction.Schema");

// Supplier Registration
const registerSupplier = async (req, res) => {
    try {
        const { storeName, contactNumber, address, bankDetails } = req.body;

        // Ensure the user is logged in
        const userId = res.locals.userId;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Validate bank details
        if (!bankDetails || !bankDetails.routingNumber) {
            return res.status(400).json({ error: "Routing number is required" });
        }

        // Check for existing supplier
        const supplierExists = await Supplier.findOne({ storeName });
        if (supplierExists) {
            return res.status(400).json({ error: "Supplier with this store name already exists" });
        }

        // Create new supplier
        const newSupplier = new Supplier({
            userId,
            storeName,
            contactNumber,
            address,
            bankDetails,
        });

        await newSupplier.save();
        res.status(201).json({ message: "Supplier registered successfully", supplier: newSupplier });
    } catch (error) {
        res.status(500).json({ error: "Error registering supplier", details: error.message });
    }
};

// Update Store Details
const updateStoreDetails = async (req, res) => {
    try {
        const { storeName, contactNumber, address, isStoreVisible } = req.body;
        const userId = res.locals.userId;

        const updatedSupplier = await Supplier.findOneAndUpdate(
            { userId },
            { storeName, contactNumber, address, isStoreVisible },
            { new: true }
        );

        if (!updatedSupplier) {
            return res.status(404).json({ error: "Supplier not found" });
        }

        res.status(200).json({ message: "Store details updated", supplier: updatedSupplier });
    } catch (error) {
        res.status(500).json({ error: "Error updating store details", details: error.message });
    }
};

// Redeem Voucher
const redeemVoucher = async (req, res) => {
    try {
        const { trackingId } = req.body;
        const userId = res.locals.userId;

        if (!trackingId) {
            return res.status(400).json({ error: "Tracking ID is required" });
        }

        const voucher = await Voucher.findOne({ trackingId });

        if (!voucher) return res.status(404).json({ error: "Voucher not found" });
        if (voucher.redeemed) return res.status(400).json({ error: "Voucher already redeemed" });

        voucher.redeemed = true;
        voucher.redeemedAt = new Date();
        voucher.beneficiaryId = userId;

        await voucher.save();
        res.status(200).json({ message: "Voucher redeemed successfully", voucher });
    } catch (error) {
        res.status(500).json({ error: "Error redeeming voucher", details: error.message });
    }
};

// Add Transaction
const addTransaction = async (req, res) => {
    try {
        const { voucherId, amount, receiptImage } = req.body;
        const userId = res.locals.userId;

        if (!voucherId || !amount || !receiptImage) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newTransaction = new Transaction({
            voucherId,
            supplierId: userId,
            amount,
            receiptImage,
        });

        await newTransaction.save();
        res.status(201).json({ message: "Transaction added successfully", transaction: newTransaction });
    } catch (error) {
        res.status(500).json({ error: "Error adding transaction", details: error.message });
    }
};

// Get Transaction History
const getTransactionHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = res.locals.userId;

        const transactions = await Transaction.find({ supplierId: userId })
            .populate("voucherId")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ transactionDate: -1 });

        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({ error: "Error fetching transaction history", details: error.message });
    }
};
// Get Shop Details
const getShop = async (req, res) => {
  try {
    const userId = res.locals.userId;

    // Fetch shop details based on the userId
    const shop = await Supplier.findOne({ userId });

    if (!shop) {
      return res.status(404).json({ error: "Shop not found for this user" });
    }

    res.status(200).json({ message: "Shop details fetched successfully", shop });
  } catch (error) {
    res.status(500).json({ error: "Error fetching shop details", details: error.message });
  }
};


module.exports = {
  registerSupplier,
  updateStoreDetails,
  redeemVoucher,
  addTransaction,
  getTransactionHistory,
  getShop, // Export the new route
};
