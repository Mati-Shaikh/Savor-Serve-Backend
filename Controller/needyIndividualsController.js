const NeedyIndividual = require("../models/NeedyIndividuals.Schema"); // Import the NeedyIndividual model
const NGO = require("../models/NGO.Schema"); // Assuming you have an NGO model

// Add a new Needy Individual
const addNeedyIndividual = async (req, res) => {
  try {
    const { name, address, contactNumber, ngoId } = req.body;

    // Optionally, validate the NGO if provided
    let ngo = null;
    if (ngoId) {
      ngo = await NGO.findById(ngoId);
      if (!ngo) {
        return res.status(404).json({ error: "NGO not found" });
      }
    }

    const newNeedyIndividual = new NeedyIndividual({
      name,
      address,
      contactNumber,
      ngo: ngo ? ngo._id : null, // Link to NGO if provided
    });

    await newNeedyIndividual.save();
    res.status(201).json({ message: "Needy individual added successfully", newNeedyIndividual });
  } catch (error) {
    console.error("Error adding needy individual:", error);
    res.status(500).json({ error: "Error adding needy individual", details: error.message });
  }
};

// Edit a Needy Individual
const editNeedyIndividual = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contactNumber, ngoId } = req.body;

    const needyIndividual = await NeedyIndividual.findById(id);
    if (!needyIndividual) {
      return res.status(404).json({ error: "Needy individual not found" });
    }

    // Optionally, validate the NGO if provided
    if (ngoId) {
      const ngo = await NGO.findById(ngoId);
      if (!ngo) {
        return res.status(404).json({ error: "NGO not found" });
      }
      needyIndividual.ngo = ngo._id;
    }

    needyIndividual.name = name || needyIndividual.name;
    needyIndividual.address = address || needyIndividual.address;
    needyIndividual.contactNumber = contactNumber || needyIndividual.contactNumber;

    await needyIndividual.save();
    res.status(200).json({ message: "Needy individual updated successfully", needyIndividual });
  } catch (error) {
    console.error("Error editing needy individual:", error);
    res.status(500).json({ error: "Error editing needy individual", details: error.message });
  }
};

const deleteNeedyIndividual = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Use findByIdAndDelete to remove the document
      const needyIndividual = await NeedyIndividual.findByIdAndDelete(id);
      if (!needyIndividual) {
        return res.status(404).json({ error: "Needy individual not found" });
      }
  
      res.status(200).json({ message: "Needy individual deleted successfully" });
    } catch (error) {
      console.error("Error deleting needy individual:", error);
      res.status(500).json({ error: "Error deleting needy individual", details: error.message });
    }
  };
  

// Get all Needy Individuals
const getAllNeedyIndividuals = async (req, res) => {
  try {
    const needyIndividuals = await NeedyIndividual.find().populate("ngo");
    res.status(200).json(needyIndividuals);
  } catch (error) {
    console.error("Error fetching needy individuals:", error);
    res.status(500).json({ error: "Error fetching needy individuals", details: error.message });
  }
};

module.exports = {
  addNeedyIndividual,
  editNeedyIndividual,
  deleteNeedyIndividual,
  getAllNeedyIndividuals,
};
