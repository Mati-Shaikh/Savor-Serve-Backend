const router = require("express").Router();
const verifyToken = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkRole"); // Import the checkRole middleware

const {
  getDonorProfile,
  updateDonorProfile,
  getWallet,
  makeDonation,
  addImpacteeRequest,
  getDonationHistory,
  addWalletAmount,
  withdrawWalletAmount,
  getImpactees,
  getDonorDonations,
  donateToNGO
} = require("../Controller/donorController");

// Define routes
router.get("/profile", verifyToken, checkRole(["Donor"]), getDonorProfile);
router.put("/profile", verifyToken, checkRole(["Donor"]), updateDonorProfile);

router.get("/wallet", verifyToken, checkRole(["Donor"]), getWallet);
router.post("/wallet/donate", verifyToken, checkRole(["Donor"]), makeDonation);
router.post("/wallet/donatetoNGO", verifyToken, checkRole(["Donor"]), donateToNGO);

router.post("/wallet/add", verifyToken, checkRole(["Donor"]), addWalletAmount);
router.post("/wallet/withdraw", verifyToken, checkRole(["Donor"]), withdrawWalletAmount);

router.post("/impactee-request", verifyToken, checkRole(["Donor"]), addImpacteeRequest);
router.get("/impactees", verifyToken, checkRole(["Donor"]), getImpactees);

router.get("/donations", verifyToken, checkRole(["Donor"]), getDonationHistory);
router.get("/donor-donations", verifyToken, checkRole(["Donor"]), getDonorDonations);

module.exports = router;