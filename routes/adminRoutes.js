const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkRole"); // Import the checkRole middleware

const {
  getAllDonors,
  getAllNGOs,
  getAllSuppliers,
  deleteDonor,
  deleteNGO,
  deleteSupplier,
  updateDonor,
  updateNGO,
  updateSupplier,
  updateImpacteeStatus,
  getAllImpactees
} = require("../Controller/adminController");

// Admin Routes for CRUD operations

// Get all Donors
router.get("/donors", verifyToken, checkRole(["Admin"]), getAllDonors);

// Get all NGOs
router.get("/ngos", verifyToken, checkRole(["Admin"]), getAllNGOs);

// Get all Suppliers (Grocery Shops)
router.get("/suppliers", verifyToken, checkRole(["Admin"]), getAllSuppliers);

// Update Donor Info
router.put("/donors/:id", verifyToken, checkRole(["Admin"]), updateDonor);

// Update NGO Info
router.put("/ngos/:id", verifyToken, checkRole(["Admin"]), updateNGO);

// Update Supplier Info
router.put("/suppliers/:id", verifyToken, checkRole(["Admin"]), updateSupplier);

// Delete Donor
router.delete("/donors/:id", verifyToken, checkRole(["Admin"]), deleteDonor);

// Delete NGO
router.delete("/ngos/:id", verifyToken, checkRole(["Admin"]), deleteNGO);

// Delete Supplier
router.delete("/suppliers/:id", verifyToken, checkRole(["Admin"]), deleteSupplier);

// Route to fetch all impactee requests
router.get("/impactees", verifyToken, checkRole(["Admin"]), getAllImpactees);

// Route to update the status of an impactee request
router.put("/impactees/:id/status",verifyToken, checkRole(["Admin"]), updateImpacteeStatus);

module.exports = router;
