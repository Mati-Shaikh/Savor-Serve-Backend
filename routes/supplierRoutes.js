const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkRole"); // Middleware for role-based access control

const {
  registerSupplier,
  updateStoreDetails,
  redeemVoucher,
  addTransaction,
  getTransactionHistory,
  getShop,
} = require("../Controller/grocerySupplierController");

// Supplier Registration & Account Setup
router.post("/register", verifyToken, checkRole(["GroceryShop"]), registerSupplier);
router.put("/update-store", verifyToken, checkRole(["GroceryShop"]), updateStoreDetails);

// Voucher Redemption System
router.post("/redeem-voucher", verifyToken, checkRole(["GroceryShop"]), redeemVoucher);

// Transaction History & Record Keeping
router.post("/add-transaction", verifyToken, checkRole(["GroceryShop"]), addTransaction);
router.get("/transaction-history", verifyToken, checkRole(["GroceryShop"]), getTransactionHistory);

// Get Specific Shop Details
// Get Shop Details for the Logged-in User
router.get("/shop", verifyToken, checkRole(["GroceryShop"]), getShop);
module.exports = router;
