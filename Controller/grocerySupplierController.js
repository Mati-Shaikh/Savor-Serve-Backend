// grocerySupplierController.js
const Supplier = require("../models/Supplier.Schema");
const Voucher = require("../models/Voucher.Schema");
const Transaction = require("../models/Transaction.Schema");

// Supplier Registration
const registerSupplier = async (req, res) => {
    try {
      const { storeName, contactNumber, address, bankDetails } = req.body;
  
      // Ensure the user is logged in by checking the token
      if (!res.locals.userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
  
      // Check if the bankDetails are provided and valid
      if (!bankDetails || !bankDetails.routingNumber) {
        return res.status(400).json({ error: "Routing number is required" });
      }
  
      // Check if the store with the same name already exists
      const supplierExists = await Supplier.findOne({ storeName });
      if (supplierExists) {
        return res.status(400).json({ error: "Supplier with this store name already exists" });
      }
  
      // Create a new Supplier document
      const newSupplier = new Supplier({
        userId: res.locals.userId, // Fetch the userId from the token in middleware
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
  
  

// Update store details
const updateStoreDetails = async (req, res) => {
    try {
      const { storeName, contactNumber, address, isStoreVisible } = req.body;
  
      // Check if supplier exists before updating
      const updatedSupplier = await Supplier.findOneAndUpdate(
        { userId: res.locals.userId },
        { storeName, contactNumber, address, isStoreVisible: isStoreVisible !== undefined ? isStoreVisible : undefined }, // Make isStoreVisible optional
        { new: true }
      );
  
      if (!updatedSupplier) return res.status(404).json({ error: "Supplier not found" });
  
      res.status(200).json({ message: "Store details updated", supplier: updatedSupplier });
    } catch (error) {
      res.status(500).json({ error: "Error updating store details", details: error.message });
    }
  };
  

// Redeem Voucher
const redeemVoucher = async (req, res) => {
    try {
      const { trackingId } = req.body;
  
      // Validate the input
      if (!trackingId) return res.status(400).json({ error: "Tracking ID is required" });
  
      // Find the voucher by tracking ID
      const voucher = await Voucher.findOne({ trackingId });
  
      if (!voucher) return res.status(404).json({ error: "Voucher not found" });
      if (voucher.redeemed) return res.status(400).json({ error: "Voucher already redeemed" });
  
      // Mark as redeemed
      voucher.redeemed = true;
      voucher.redeemedAt = new Date();
      voucher.beneficiaryId = res.locals.userId; // Assuming user is redeeming it
  
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
  
      // Validate the input fields
      if (!voucherId || !amount || !receiptImage) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const newTransaction = new Transaction({
        voucherId,
        supplierId: res.locals.userId,
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
      const { page = 1, limit = 10 } = req.query; // Default pagination values
      const transactions = await Transaction.find({ supplierId: res.locals.userId })
        .populate('voucherId')
        .skip((page - 1) * limit)  // Pagination skip
        .limit(limit)  // Pagination limit
        .sort({ transactionDate: -1 });
  
      res.status(200).json({ transactions });
    } catch (error) {
      res.status(500).json({ error: "Error fetching transaction history", details: error.message });
    }
  };
  

module.exports = { registerSupplier, updateStoreDetails, redeemVoucher, addTransaction, getTransactionHistory };
