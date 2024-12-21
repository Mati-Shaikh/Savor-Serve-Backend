const Donor = require('../models/User.schema');  // Model for Donors
const NGO = require('../models/NGO.Schema');      // Model for NGOs
const Supplier = require('../models/Supplier.Schema');  // Model for Grocery Suppliers
const ImpacteeRequest = require("../models/Impactee.Schema");
const nodemailer = require('nodemailer');
const User = require('../models/User.schema'); // Adjust the path according to your project structure
const Donations = require('../models/Donation.Schema');

// Helper function to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (res.locals.role !== 'admin') {  // Assuming the role is stored in the JWT payload
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }
  next();
};

const getAllDonors = async (req, res) => {
  try {
    // Find all users with the role of "Donor"
    const donors = await User.find({ Role: "Donor" });

    // If no donors found
    if (!donors || donors.length === 0) {
      return res.status(404).json({ error: "No donors found" });
    }

    // Fetch donations for each donor and include NGO and Supplier details
    const donorDetails = await Promise.all(
      donors.map(async (donor) => {
        // Find donations related to this donor
        const donations = await Donations.find({ donorId: donor._id })
          .populate("ngoId", "name") // Populate NGO name only
          .populate("supplierId", "storeName contactNumber address") // Populate Supplier details
          .populate("impacteeId", "FirstName LastName Email") // Populate Impactee details
          .exec();

        // Return donor details along with their donations
        return {
          donor: {
            id: donor._id,
            firstName: donor.FirstName,
            lastName: donor.LastName,
            email: donor.Email,
            phone: donor.PhoneNumber,
          },
          donations: donations.map((donation) => ({
            id: donation._id,
            amount: donation.amount,
            status: donation.status,
            date: donation.date,
            ngo: donation.ngoId ? donation.ngoId.name : "N/A",
            supplier: donation.supplierId
              ? `${donation.supplierId.storeName} - ${donation.supplierId.contactNumber}`
              : "N/A",
            impactee: donation.impacteeId
              ? `${donation.impacteeId.FirstName} ${donation.impacteeId.LastName}`
              : "N/A",
          })),
        };
      })
    );

    // Send response
    res.status(200).json({ success: true, donors: donorDetails });
  } catch (error) {
    // Handle errors
    res
      .status(500)
      .json({ error: "Error fetching donors", details: error.message });
  }
};





// Get all registered NGOs
const getAllNGOs = async (req, res) => {
  try {
    // Populate causes to include their embedded packages automatically
    const ngos = await NGO.find()
      .populate({
        path: "causes", // Populate the causes field
      })
      .populate("donations.donorId", "name email") // Populate donor details if required
      .exec();

    res.status(200).json({ success: true, ngos });
  } catch (error) {
    res.status(500).json({
      error: "Error fetching NGOs",
      details: error.message,
    });
  }
};



// Get all grocery suppliers (shops)
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json({ suppliers });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching suppliers', details: error.message });
  }
};

// Delete a donor
const deleteDonor = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the donor in one step
      const donor = await Donor.findByIdAndDelete(id);
  
      if (!donor) {
        return res.status(404).json({ error: "Donor not found" });
      }
  
      // Return the deleted donor for confirmation
      res.status(200).json({ message: "Donor deleted successfully", deletedDonor: donor });
    } catch (error) {
      res.status(500).json({ error: "Error deleting donor", details: error.message });
    }
  };
  
  

// Delete an NGO
const deleteNGO = async (req, res) => {
    try {
      const { id } = req.params;
      const ngo = await NGO.findByIdAndDelete(id);
  
      if (!ngo) {
        return res.status(404).json({ error: "NGO not found" });
      }
  
      //await ngo.remove(); // Ensures pre-hooks (if any) are triggered
      res.status(200).json({ message: "NGO deleted successfully", deletedNGO: ngo });
    } catch (error) {
      res.status(500).json({ error: "Error deleting NGO", details: error.message });
    }
  };
  

// Delete a supplier
const deleteSupplier = async (req, res) => {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByIdAndDelete(id);
  
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
  
      //await supplier.remove(); // Ensures pre-hooks (if any) are triggered
      res.status(200).json({ message: "Supplier deleted successfully", deletedSupplier: supplier });
    } catch (error) {
      res.status(500).json({ error: "Error deleting supplier", details: error.message });
    }
  };
  

// Update a donor
const updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { FirstName, LastName,Email, PhoneNumber } = req.body;

    const donor = await Donor.findByIdAndUpdate(id, { FirstName, LastName, Email,PhoneNumber }, { new: true });

    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.status(200).json({ message: 'Donor updated successfully', donor });
  } catch (error) {
    res.status(500).json({ error: 'Error updating donor', details: error.message });
  }
};

// Update NGO information
const updateNGO = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        registrationNumber,
        description,
        address,
        phone,
        website,
        causes,
        packages,
        impactees,
      } = req.body;
  
      const updatedFields = {};
  
      // Dynamically add fields to update only if provided
      if (name) updatedFields.name = name;
      if (registrationNumber) updatedFields.registrationNumber = registrationNumber;
      if (description) updatedFields.description = description;
      if (address) updatedFields.address = address;
      if (phone) updatedFields.phone = phone;
      if (website) updatedFields.website = website;
  
      // Find and update NGO fields
      const ngo = await NGO.findById(id);
      if (!ngo) {
        return res.status(404).json({ error: "NGO not found" });
      }
  
      // Update the fields
      Object.assign(ngo, updatedFields);
  
      // Update causes if provided
      if (causes) {
        ngo.causes = causes.map((cause) => ({
          title: cause.title,
          description: cause.description,
          goal: cause.goal,
          timeline: cause.timeline,
        }));
      }
  
      // Update packages if provided
      if (packages) {
        ngo.packages = packages.map((pkg) => ({
          title: pkg.title,
          description: pkg.description,
          price: pkg.price,
          causeId: pkg.causeId,
        }));
      }
  
      // Update impactees if provided
      if (impactees) {
        ngo.impactees = impactees.map((impactee) => ({
          name: impactee.name,
          phone: impactee.phone,
          cnic: impactee.cnic,
        }));
      }
  
      // Save the updated NGO
      const updatedNGO = await ngo.save();
  
      res.status(200).json({ message: "NGO updated successfully", ngo: updatedNGO });
    } catch (error) {
      res.status(500).json({ error: "Error updating NGO", details: error.message });
    }
  };

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeName, contactNumber, address, bankDetails, isStoreVisible } = req.body;

    // Validate the presence of required fields
    if (!storeName || !contactNumber || !address || !bankDetails) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    // Ensure bankDetails has all required fields
    if (
      !bankDetails.accountNumber ||
      !bankDetails.bankName ||
      !bankDetails.routingNumber
    ) {
      return res.status(400).json({ error: 'Bank details are incomplete.' });
    }

    // Update the supplier
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { storeName, contactNumber, address, bankDetails, isStoreVisible },
      { new: true, runValidators: true } // runValidators ensures schema validation on updates
    );

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier updated successfully', supplier });
  } catch (error) {
    res.status(500).json({ error: 'Error updating supplier', details: error.message });
  }
};


const getAllImpactees = async (req, res) => {
    try {
      const impactees = await ImpacteeRequest.find().populate("donorId", "name email");
      res.status(200).json({ message: "Impactees fetched successfully", impactees });
    } catch (error) {
      res.status(500).json({ error: "Error fetching impactees", details: error.message });
    }
  };

  const updateImpacteeStatus = async (req, res) => {
    try {
      const { id } = req.params; // Impactee request ID
      const { status } = req.body; // New status: Approved or Rejected
  
      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value. Use 'Approved' or 'Rejected'." });
      }
  
      const impactee = await ImpacteeRequest.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!impactee) {
        return res.status(404).json({ error: "Impactee request not found" });
      }
  
      res.status(200).json({ message: "Impactee status updated successfully", impactee });
    } catch (error) {
      res.status(500).json({ error: "Error updating impactee status", details: error.message });
    }
  };

  // adminAuthController.js

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Add these to your .env file
    pass: process.env.EMAIL_PASSWORD
  }
});

// Store OTPs temporarily (In production, use Redis or similar)
const otpStore = new Map();

const sendAdminOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = res.locals.userId; // Assuming you have authentication middleware


    // Verify if the user is actually an admin
    const user = await User.findById(userId);
    if (!user || res.locals.userRole !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with email (with 5-minute expiration)
    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Admin Verification OTP',
      html: `
        <h1>Admin Verification</h1>
        <p>Your OTP for admin verification is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userId = req.user.id;

    // Verify if the user is actually an admin
    const user = await User.findById(userId);
    if (!user || user.Role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Check if OTP exists and is valid
    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    if (Date.now() > storedOTPData.expires) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedOTPData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP after successful verification
    otpStore.delete(email);

    res.status(200).json({ message: 'Admin verified successfully' });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};
  

module.exports = {
  isAdmin,
  getAllDonors,
  getAllNGOs,
  getAllSuppliers,
  deleteDonor,
  deleteNGO,
  deleteSupplier,
  updateDonor,
  updateNGO,
  updateSupplier,
  getAllImpactees,
  updateImpacteeStatus,
  sendAdminOTP,
  verifyAdminOTP
};
