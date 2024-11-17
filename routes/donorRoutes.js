const router = require("express").Router();
const verifyToken = require("./authentication");

const {
  getDonorProfile,
  updateDonorProfile,
  getWallet,
  makeDonation,
  addImpacteeRequest,
  getDonationHistory,
} = require("../Controller/donorController");

// Define routes
router.get("/profile", verifyToken, getDonorProfile);
router.put("/profile", verifyToken, updateDonorProfile);

router.get("/wallet", verifyToken, getWallet);
router.post("/wallet/donate", verifyToken, makeDonation);

router.post("/impactee-request", verifyToken, addImpacteeRequest);
router.get("/donations", verifyToken, getDonationHistory);

module.exports = router;
