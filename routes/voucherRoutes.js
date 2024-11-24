const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authentication"); // Middleware to verify token
const checkRole = require("../middlewares/checkRole"); // Middleware for role-based access

const {
  createVoucher,
  createVoucherForShop,
  updateVoucherStatus,
  getAllVouchers,
  redeemVoucher
} = require("../Controller/voucherController");

// Route to create a voucher (Donor only)
router.post(
  "/voucher/:impacteeId",
  verifyToken, // Ensure the user is authenticated
  checkRole(["Donor"]), // Only Donors can create vouchers
  createVoucher
);

router.post(
  "/voucherShop/:shopId",
  verifyToken, // Ensure the user is authenticated
  checkRole(["Donor"]), // Only Donors can create vouchers
  createVoucherForShop
);

// Route to update voucher status (Shopkeeper or Admin only)
router.put(
  "/update-status/:Id",
  //verifyToken, // Ensure the user is authenticated
  updateVoucherStatus
);

// // Route to track voucher history (Admin and Shopkeeper can view)
router.get(
  "/getVouchers",
  verifyToken, // Ensure the user is authenticated
  getAllVouchers
);


router.put("/redeem", redeemVoucher);
module.exports = router;
