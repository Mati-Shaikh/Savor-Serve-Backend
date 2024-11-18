const NGO = require("../models/NGO.Schema");
const User = require("../models/User.schema");

let registerNGO = async (req, res) => {
  try {
    const { name, registrationNumber, description, address, phone, website } = req.body;

    // Ensure the user is logged in by checking the token
    if (!res.locals.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if the NGO with the same registration number already exists
    const ngoExists = await NGO.findOne({ registrationNumber });
    if (ngoExists) {
      return res.status(400).json({ error: "NGO with this registration number already exists" });
    }

    // Create a new NGO document
    const ngo = new NGO({
      userId: res.locals.userId, // Fetch the userId from the token in middleware
      name,
      registrationNumber,
      description,
      address,
      phone,
      website,
    });

    await ngo.save();
    res.status(201).json({ message: "NGO registered successfully", ngo });
  } catch (error) {
    res.status(500).json({ error: "Error registering NGO", details: error.message });
  }
};

let updateNGOProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Ensure the user is logged in
    if (!res.locals.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Find the NGO using userId
    const ngo = await NGO.findOneAndUpdate(
      { userId: res.locals.userId },
      updates,
      { new: true }
    );

    if (!ngo) {
      return res.status(404).json({ error: "NGO not found" });
    }

    res.status(200).json({ message: "NGO profile updated", ngo });
  } catch (error) {
    res.status(500).json({ error: "Error updating NGO profile", details: error.message });
  }
};

let addCause = async (req, res) => {
  try {
    const { title, description, goal, timeline } = req.body;

    // Ensure the user is logged in
    if (!res.locals.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const ngo = await NGO.findOne({ userId: res.locals.userId });
    if (!ngo) return res.status(404).json({ error: "NGO not found" });

    ngo.causes.push({ title, description, goal, timeline });
    await ngo.save();

    res.status(201).json({ message: "Cause added successfully", causes: ngo.causes });
  } catch (error) {
    res.status(500).json({ error: "Error adding cause", details: error.message });
  }
};

let addPackage = async (req, res) => {
  try {
    const { title, description, price, causeId } = req.body;

    // Ensure the user is logged in
    if (!res.locals.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const ngo = await NGO.findOne({ userId: res.locals.userId });
    if (!ngo) return res.status(404).json({ error: "NGO not found" });

    ngo.packages.push({ title, description, price, causeId });
    await ngo.save();

    res.status(201).json({ message: "Package added successfully", packages: ngo.packages });
  } catch (error) {
    res.status(500).json({ error: "Error adding package", details: error.message });
  }
};

const getDonationDashboard = async (req, res) => {
    try {
      const ngo = await NGO.findOne({ userId: res.locals.userId })
        .populate("packages.causeId");  // Populate causeId inside the packages array
  
      if (!ngo) return res.status(404).json({ error: "NGO not found" });
  
      const donationData = ngo.causes.map((cause) => ({
        title: cause.title,
        goal: cause.goal,
        raised: cause.raised,
      }));
  
      res.status(200).json({ donationData });
    } catch (error) {
      res.status(500).json({ error: "Error fetching donation data", details: error.message });
    }
  };
  

let addImpactee = async (req, res) => {
  try {
    const { name, phone, cnic } = req.body;

    // Ensure the user is logged in
    if (!res.locals.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const impacteeExists = await NGO.findOne({ "impactees.cnic": cnic });
    if (impacteeExists) {
      return res.status(400).json({ error: "Impactee with this CNIC already exists" });
    }

    const ngo = await NGO.findOne({ userId: res.locals.userId });
    if (!ngo) return res.status(404).json({ error: "NGO not found" });

    ngo.impactees.push({ name, phone, cnic });
    await ngo.save();

    res.status(201).json({ message: "Impactee added successfully", impactees: ngo.impactees });
  } catch (error) {
    res.status(500).json({ error: "Error adding impactee", details: error.message });
  }
};

let getImpactees = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: res.locals.userId });

    if (!ngo) return res.status(404).json({ error: "NGO not found" });

    res.status(200).json({ impactees: ngo.impactees });
  } catch (error) {
    res.status(500).json({ error: "Error fetching impactees", details: error.message });
  }
};

module.exports = {
  registerNGO,
  updateNGOProfile,
  addCause,
  addPackage,
  getDonationDashboard,
  addImpactee,
  getImpactees,
};
