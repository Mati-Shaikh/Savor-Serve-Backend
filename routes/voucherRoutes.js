const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authentication"); // Middleware to verify token
const checkRole = require("../middlewares/checkRole"); // Middleware for role-based access

const {
  createVoucher,
  updateVoucherStatus,
  trackVoucherHistory,
} = require("../controllers/voucherController");

// Route to create a voucher (Donor only)
router.post(
  "/create",
  verifyToken, // Ensure the user is authenticated
  checkRole(["Donor"]), // Only Donors can create vouchers
  createVoucher
);

// Route to update voucher status (Shopkeeper or Admin only)
router.put(
  "/update-status",
  verifyToken, // Ensure the user is authenticated
  checkRole(["Shopkeeper", "Admin"]), // Only Shopkeepers or Admins can update the status
  updateVoucherStatus
);

// Route to track voucher history (Admin and Shopkeeper can view)
router.get(
  "/history",
  verifyToken, // Ensure the user is authenticated
  checkRole(["Admin", "Shopkeeper"]), // Admin and Shopkeepers can access voucher history
  trackVoucherHistory
);

module.exports = router;
