const mongoose = require('mongoose');
const NGO = require("../models/NGO.Schema");
const User = require("../models/User.schema");
const { Cause } = require('../models/Cause.Schema');

let registerNGO = async (req, res) => {
  try {
    const { name, registrationNumber, description, address, phone, website, impactees } = req.body;

    // Ensure the user is logged in by checking the token
    if (!res.locals.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if the NGO with the same registration number already exists
    const ngoExists = await NGO.findOne({ registrationNumber });
    if (ngoExists) {
      return res.status(400).json({ error: "NGO with this registration number already exists" });
    }

    // If `impactees` is undefined or null, assign an empty array
    const sanitizedImpactees = (impactees || []).map(impactee => {
      // Remove impactees with null or empty `cnic`
      if (!impactee.cnic || impactee.cnic.trim() === "") {
        impactee.cnic = "default_cnic_value";  // You can assign a default value or leave it empty
      }
      return impactee;
    });

    // Create a new NGO document
    const ngo = new NGO({
      userId: res.locals.userId, // Fetch the userId from the token in middleware
      name,
      registrationNumber,
      description,
      address,
      phone,
      website,
      impactees: sanitizedImpactees,  // Use sanitized impactees
    });

    await ngo.save();
    res.status(201).json({ message: "NGO registered successfully", ngo });
  } catch (error) {
    res.status(500).json({ error: "Error registering NGO", details: error.message });
  }
};

let updateNGOProfile = async (req, res) => {
  const { ngoId } = req.params;  // Retrieve NGO ID from the URL parameters
  const { name, description, address, phone, website } = req.body;

  try {
    // Ensure the logged-in NGO matches the ngoId in the URL
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    // Ensure the user is authenticated and has the right access
    if (!res.locals.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if the logged-in user (from res.locals.userId) is the owner of this NGO
    if (ngo.userId.toString() !== res.locals.userId.toString()) {  // Ensure the logged-in user is the owner of this NGO
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the NGO's profile with the provided data or keep existing values
    ngo.name = name || ngo.name;
    ngo.description = description || ngo.description;
    ngo.address = address || ngo.address;
    ngo.phone = phone || ngo.phone;
    ngo.website = website || ngo.website;

    // Save the updated NGO profile
    await ngo.save();
    res.status(200).json({ message: 'NGO profile updated successfully', data: ngo });
  } catch (err) {
    res.status(500).json({ message: 'Error updating NGO profile', error: err.message });
  }
};


let addImpactee = async (req, res) => {
  const { ngoId } = req.params;
  const { name, phone, cnic } = req.body;

  try {
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    const newImpactee = { name, phone, cnic, ngo: ngoId };
    ngo.impactees.push(newImpactee);
    await ngo.save();

    res.status(201).json({ message: 'Impactee added successfully', data: newImpactee });
  } catch (err) {
    res.status(500).json({ message: 'Error adding impactee', error: err.message });
  }
};


let getImpactees = async (req, res) => {
  const { ngoId } = req.params;

  try {
    const ngo = await NGO.findById(ngoId).populate('impactees');
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    res.status(200).json({ impactees: ngo.impactees });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching impactees', error: err.message });
  }
};


let addCause = async (req, res) => {
  const { ngoId } = req.params;  // NGO ID from the URL
  const { title, description, goal, timeline } = req.body;

  try {
    // Validate ngoId
    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ message: 'Invalid NGO ID format' });
    }

    // Find NGO
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }
    // console.log(ngo);
    

    // Create a new Cause instance
    const newCause = new Cause({
      title,
      description,
      goal,
      timeline,
    });

    // Save the new Cause to the database
    await newCause.save();

    // Add the new cause to the NGO's causes array
    ngo.causes.push(newCause._id);  // Push only the _id of the Cause

    // Save the updated NGO document
    await ngo.save();

    res.status(201).json({ message: 'Cause added successfully', data: newCause });
  } catch (err) {
    res.status(500).json({ message: 'Error adding cause', error: err.message });
  }
};



let addPackage = async (req, res) => {
  const { ngoId, causeId } = req.params; // NGO and Cause ID should be passed in the URL
  const { title, description, price } = req.body;

  try {
    // Validate ngoId and causeId
    if (!mongoose.Types.ObjectId.isValid(ngoId) || !mongoose.Types.ObjectId.isValid(causeId)) {
      return res.status(400).json({ message: 'Invalid NGO or Cause ID format' });
    }

    // Find the NGO by its ObjectId
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }
    let foundCause = await Cause.findById(causeId);
    console.log('cause is:', foundCause);
    

    // Find the Cause by its ObjectId and update directly
    const updatedCause = await Cause.findOneAndUpdate(
      { _id: causeId },
      {
        $push: {
          packages: { title, description, price }  // Add new package to the packages array
        }
      },
      { new: true }  // Return the updated cause
    );

    if (!updatedCause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    // Respond with success
    res.status(201).json({ message: 'Package added successfully', data: { title, description, price } });
  } catch (err) {
    // Catch any errors and return a response
    res.status(500).json({ message: 'Error adding package', error: err.message });
  }
};




let getDonationDashboard = async (req, res) => {
  try {
    // Find the NGO by the logged-in user's ID (no need for ObjectId conversion here)
    const ngo = await NGO.findById(req.locals.userId).populate('causes');
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    // Fetch donation data (this would typically come from a donation model, assuming it exists)
    const donationData = ngo.donations; // You would populate donations here based on your DB structure
    res.status(200).json({ donationData });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching donation dashboard', error: err.message });
  }
};


let addDonation = async (req, res) => {
  try {
    const { donorName, amount, causeId } = req.body;

    // Ensure the user is logged in
    if (!res.locals.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Find the NGO by userId
    const ngo = await NGO.findOne({ userId: res.locals.userId });
    if (!ngo) return res.status(404).json({ error: "NGO not found" });

    // Convert causeId to ObjectId for validation
    const causeObjectId = mongoose.Types.ObjectId(causeId);

    // Find the cause by causeId (now converted to ObjectId)
    const cause = ngo.causes.id(causeObjectId);
    if (!cause) return res.status(404).json({ error: "Cause not found" });

    // Update the raised amount for the cause
    cause.raised += amount;
    await ngo.save();

    // Record the donation in the NGO's donation list
    ngo.donations.push({
      donorName,
      amount,
      causeId: causeObjectId,
      date: new Date(),
    });

    await ngo.save();

    res.status(201).json({ message: "Donation added successfully", donations: ngo.donations });
  } catch (error) {
    res.status(500).json({ error: "Error adding donation", details: error.message });
  }
};


let getTotalDonations = async (req, res) => {
  try {
    // Find the NGO by userId
    const ngo = await NGO.findOne({ userId: res.locals.userId });
    if (!ngo) return res.status(404).json({ error: "NGO not found" });

    // Calculate total donations raised by summing the amounts from the donations list
    const totalDonations = ngo.donations.reduce((total, donation) => total + donation.amount, 0);

    res.status(200).json({ totalDonations });
  } catch (error) {
    res.status(500).json({ error: "Error fetching total donations", details: error.message });
  }
};


module.exports = {
  registerNGO,
  updateNGOProfile,
  addImpactee,
  getImpactees,
  addCause,
  addPackage,
  getDonationDashboard,
  addDonation,
  getTotalDonations,
};
