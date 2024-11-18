const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkRole"); // Import the checkRole middleware

const {
  registerSupplier,
  updateStoreDetails,
  redeemVoucher,
  addTransaction,
  getTransactionHistory,
} = require("../Controller/grocerySupplierController");

// Supplier Registration & Account Setup
router.post("/register", verifyToken, checkRole(["Supplier"]), registerSupplier);
router.put("/update-store", verifyToken, checkRole(["Supplier"]), updateStoreDetails);

// Voucher Redemption System
router.post("/redeem-voucher", verifyToken, checkRole(["Supplier"]), redeemVoucher);

// Transaction History & Record Keeping
router.post("/add-transaction", verifyToken, checkRole(["Supplier"]), addTransaction);
router.get("/transaction-history", verifyToken, checkRole(["Supplier"]), getTransactionHistory);

module.exports = router;
