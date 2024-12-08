const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const checkRole = require("../middlewares/checkRole"); // Import middleware for role-based access

const {
  addNeedyIndividual,
  editNeedyIndividual,
  deleteNeedyIndividual,
  getAllNeedyIndividuals,
} = require("../Controller/needyIndividualsController"); // Import the needy individual controller

// Route to add a new needy individual (Admin only)
router.post(
  "/needy",
  verifyToken,
  checkRole(["Admin"]), // Only Admins can add a needy individual
  addNeedyIndividual
);

// Route to get all needy individuals (Admin and Donor can view)
router.get(
  "/needy",// Admin and Donors can access the list
  getAllNeedyIndividuals
);

// Route to edit a needy individual (Admin only)
router.put(
  "/needy/:id",
  verifyToken,
  checkRole(["Admin"]), // Only Admins can edit
  editNeedyIndividual
);

// Route to delete a needy individual (Admin only)
router.delete(
  "/needy/:id",
  verifyToken,
  checkRole(["Admin"]), // Only Admins can delete
  deleteNeedyIndividual
);

module.exports = router;
