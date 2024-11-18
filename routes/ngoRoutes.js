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
} = require("../Controller/ngoController");

// NGO Registration & Profile Management
router.post("/register", verifyToken, checkRole(["NGO"]), registerNGO);
router.put("/updateprofile", verifyToken, checkRole(["NGO"]), updateNGOProfile);

// Cause, Project, and Package Management
router.post("/addcause", verifyToken, checkRole(["NGO"]), addCause);
router.post("/addpackage", verifyToken, checkRole(["NGO"]), addPackage);

// Donation Tracking & Analytics
router.get("/donation-dashboard", verifyToken, checkRole(["NGO"]), getDonationDashboard);

// Impactee Management
router.post("/addimpactee", verifyToken, checkRole(["NGO"]), addImpactee);
router.get("/getimpactees", verifyToken, checkRole(["NGO"]), getImpactees);

module.exports = router;
