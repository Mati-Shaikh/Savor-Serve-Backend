const express = require("express");
const router = express.Router();

const {
  addNeedyIndividual,
  editNeedyIndividual,
  deleteNeedyIndividual,
  getAllNeedyIndividuals,
} = require("../Controller/needyIndividualsController"); // Import the needy individual controller

// Route to add a new needy individual
router.post("/needy", addNeedyIndividual);

// Route to get all needy individuals
router.get("/needy", getAllNeedyIndividuals);

// Route to edit a needy individual
router.put("/needy/:id", editNeedyIndividual);

// Route to delete a needy individual
router.delete("/needy/:id", deleteNeedyIndividual);

module.exports = router;
