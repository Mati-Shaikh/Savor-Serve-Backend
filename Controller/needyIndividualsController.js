const NeedyIndividual = require("../models/NeedyIndividuals.Schema");

// Add a new Needy Individual
const addNeedyIndividual = async (req, res) => {
  try {
    const { name, address, contactNumber } = req.body;
    const adminId = res.locals.userId; // Retrieve Admin ID from token

    const newNeedyIndividual = new NeedyIndividual({
      name,
      address,
      contactNumber,
      createdBy: adminId, // Log Admin ID
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
    const { name, address, contactNumber } = req.body;
    const adminId = res.locals.userId; // Retrieve Admin ID from token

    const needyIndividual = await NeedyIndividual.findById(id);
    if (!needyIndividual) {
      return res.status(404).json({ error: "Needy individual not found" });
    }

    needyIndividual.name = name || needyIndividual.name;
    needyIndividual.address = address || needyIndividual.address;
    needyIndividual.contactNumber = contactNumber || needyIndividual.contactNumber;
    needyIndividual.updatedBy = adminId; // Log Admin ID

    await needyIndividual.save();
    res.status(200).json({ message: "Needy individual updated successfully", needyIndividual });
  } catch (error) {
    console.error("Error editing needy individual:", error);
    res.status(500).json({ error: "Error editing needy individual", details: error.message });
  }
};

// Delete a Needy Individual
const deleteNeedyIndividual = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = res.locals.userId; // Retrieve Admin ID from token

    const needyIndividual = await NeedyIndividual.findByIdAndDelete(id);
    if (!needyIndividual) {
      return res.status(404).json({ error: "Needy individual not found" });
    }

    // Log Admin ID for auditing purposes
    console.log(`Admin with ID ${adminId} deleted NeedyIndividual with ID ${id}`);

    res.status(200).json({ message: "Needy individual deleted successfully" });
  } catch (error) {
    console.error("Error deleting needy individual:", error);
    res.status(500).json({ error: "Error deleting needy individual", details: error.message });
  }
};

// Get all Needy Individuals
const getAllNeedyIndividuals = async (req, res) => {
  try {
    const needyIndividuals = await NeedyIndividual.find()
      .populate("createdBy", "name email") // Include Admin who created the individual
      .populate("updatedBy", "name email"); // Include Admin who last updated the individual

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
