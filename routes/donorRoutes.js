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
  donateToNGO,
  donateToSupplier,
  getAllNGOs,
  getAllSuppliers
} = require("../Controller/donorController");



// Define routes
router.get("/profile", verifyToken, checkRole(["Donor"]), getDonorProfile);
router.put("/profile", verifyToken, checkRole(["Donor"]), updateDonorProfile);

router.get("/wallet", verifyToken, checkRole(["Donor"]), getWallet);
router.post("/wallet/donate", verifyToken, checkRole(["Donor"]), makeDonation);
router.post("/donate/donatetoNGO", verifyToken, checkRole(["Donor"]), donateToNGO);
router.post("/donate/donatetoSupplier", verifyToken, checkRole(["Donor"]), donateToSupplier);

router.post("/wallet/add", verifyToken, checkRole(["Donor"]), addWalletAmount);
router.post("/wallet/withdraw", verifyToken, checkRole(["Donor"]), withdrawWalletAmount);

router.post("/impactee-request", verifyToken, checkRole(["Donor"]), addImpacteeRequest);
router.get("/impactees", verifyToken, checkRole(["Donor"]), getImpactees);

router.get("/donations", verifyToken, checkRole(["Donor"]), getDonationHistory);
router.get("/donor-donations", verifyToken, checkRole(["Donor"]), getDonorDonations);


//get ngos and supplier
router.get("/donate/getNgos", verifyToken, checkRole(["Donor"]), getAllNGOs); // Track Voucher History
router.get("/donate/getSupplier", verifyToken, checkRole(["Donor"]), getAllSuppliers); // Track Voucher History


module.exports = router;