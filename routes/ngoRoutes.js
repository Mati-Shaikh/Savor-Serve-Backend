const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkRole"); // Import the checkRole middleware

const {
  registerNGO,
  updateNGOProfile,
  addCause,
  addPackage,
  getDonationDashboard,
  addImpactee,
  getImpactees,
  addDonation,
  getTotalDonations,
  getNgo
} = require("../Controller/ngoController");

// NGO Registration & Profile Management
router.post("/register", verifyToken, checkRole(["NGO"]), registerNGO);
router.put("/updateprofile/:ngoId", verifyToken, checkRole(["NGO"]), updateNGOProfile);

// Cause, Project, and Package Management
router.post("/addcause/:ngoId", verifyToken, checkRole(["NGO"]), addCause);
router.post("/:ngoId/causes/:causeId/packages", verifyToken, checkRole(["NGO"]), addPackage);

// Donation Tracking & Analytics
router.get("/donation-dashboard", verifyToken, checkRole(["NGO"]), getDonationDashboard);
router.get("/total-donations", verifyToken, checkRole(["NGO"]), getTotalDonations); // Added route for total donations

// Impactee Management
router.post("/addimpactee/:ngoId/impactees", verifyToken, checkRole(["NGO"]), addImpactee);
router.get("/getimpactees/:ngoId/impactees", verifyToken, checkRole(["NGO"]), getImpactees);


router.get("/getNGO/:ngoId", verifyToken, checkRole(["NGO"]), getNgo);


//This Route Might not make sense accoring to my POV
// Donations Management
router.post("/adddonation", verifyToken, checkRole(["NGO"]), addDonation); // Added route for adding donation

module.exports = router;
