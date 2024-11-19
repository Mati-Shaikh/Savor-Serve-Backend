const User = require("../models/User.schema");
const Wallet = require("../models/Wallet.Schema");
const Donation = require("../models/Donation.Schema");
const ImpacteeRequest = require("../models/Impactee.Schema");
const NeedyIndividual = require('../models/NeedyIndividuals.Schema');
const NGO = require('../models/NGO.Schema');    // Model for NGOs
const Supplier = require('../models/Supplier.Schema');  // Model for Grocery Suppliers


// Get all registered NGOs
const getAllNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find();
    res.status(200).json({ ngos });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching NGOs', details: error.message });
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

// Fetch donor profile
const getDonorProfile = async (req, res) => {
    try {
      const donor = await User.findById(res.locals.userId); // Use res.locals.userId instead of req.user.id
      if (!donor) {
        return res.status(404).json({ error: "Donor not found." });
      }
      res.status(200).json(donor);
    } catch (error) {
      console.error("Error fetching donor profile:", error);
      res.status(500).json({ error: "Failed to fetch donor profile." });
    }
  };
  

// Update donor profile
const updateDonorProfile = async (req, res) => {
    try {
      const updatedDonor = await User.findByIdAndUpdate(
        res.locals.userId, // Use res.locals.userId
        req.body,
        { new: true }
      );
      if (!updatedDonor) {
        return res.status(404).json({ error: "Donor not found." });
      }
      res.status(200).json(updatedDonor);
    } catch (error) {
      console.error("Error updating donor profile:", error);
      res.status(500).json({ error: "Failed to update donor profile." });
    }
  };
  
// Wallet balance and transactions
let getWallet = async (req, res) => {
    try {
      const wallet = await Wallet.findOne({ userId: res.locals.userId }); // Use res.locals.userId
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found." });
      }
      res.status(200).json(wallet);
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      res.status(500).json({ error: "Failed to fetch wallet details." });
    }
  };
  

// Make a donation
let makeDonation = async (req, res) => {
  try {
    const { amount, impacteeId } = req.body;

    // Check if the impactee exists and is approved
    const impactee = await ImpacteeRequest.findById(impacteeId);
    if (!impactee) {
      return res.status(404).json({ error: "Impactee not found." });
    }
    if (impactee.status !== "Approved") {
      return res.status(400).json({ error: "Impactee is not approved for donations." });
    }

    // Find the donor's wallet
    const wallet = await Wallet.findOne({ userId: res.locals.userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found." });
    }

    // Ensure sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Deduct the amount and save the wallet
    wallet.balance -= amount;
    wallet.transactions.push({ type: "donation", amount });  // "donation" is added as a valid enum
    await wallet.save();

    // Create a new donation record
    const donation = new Donation({
      donorId: res.locals.userId,
      impacteeId,
      amount,
      status: "Pending", // Donations can have statuses for further processing
    });
    await donation.save();

    res.status(200).json({ message: "Donation successful.", donation });
  } catch (error) {
    console.error("Error making donation:", error.message);
    res.status(500).json({ error: "Failed to make donation.", details: error.message });
  }
};


  
  let addImpacteeRequest = async (req, res) => {
    try {
      const request = new ImpacteeRequest({
        donorId: res.locals.userId, // Use res.locals.userId
        impacteeDetails: req.body,
      });
      await request.save();
  
      res.status(200).json({ message: "Impactee request submitted." });
    } catch (error) {
      console.error("Error submitting impactee request:", error);
      res.status(500).json({ error: "Failed to submit impactee request." });
    }
  };
  

// Get donation history
let getDonationHistory = async (req, res) => {
    try {
      const donations = await Donation.find({ donorId: res.locals.userId }) // Use res.locals.userId
        .populate("impacteeId");
  
      if (!donations || donations.length === 0) {
        return res.status(404).json({ error: "No donation history found." });
      }
  
      res.status(200).json(donations);
    } catch (error) {
      console.error("Error fetching donation history:", error);
      res.status(500).json({ error: "Failed to fetch donation history." });
    }
  };
  
// Add amount to the wallet
const addWalletAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Ensure wallet is fetched correctly
    const wallet = await Wallet.findOne({ userId: res.locals.userId });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    wallet.balance += amount;
    wallet.transactions.push({ type: "credit", amount });
    await wallet.save();

    res.status(200).json({ message: "Amount added successfully", wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add amount" });
  }
};


// Withdraw amount from the wallet
const withdrawWalletAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ userId: res.locals.userId });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    wallet.balance -= amount;
    wallet.transactions.push({ type: "debit", amount });
    await wallet.save();

    res.status(200).json({ message: "Amount withdrawn successfully", wallet });
  } catch (error) {
    res.status(500).json({ error: "Failed to withdraw amount" });
  }
};

// Get impactees created by the donor
const getImpactees = async (req, res) => {
  try {
    const impactees = await ImpacteeRequest.find({ donorId: res.locals.userId });

    if (!impactees.length) {
      return res.status(404).json({ message: "No impactees found" });
    }

    res.status(200).json(impactees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch impactees" });
  }
};

// Get all donations made by the donor
const getDonorDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: res.locals.userId }).populate("impacteeId");

    if (!donations.length) {
      return res.status(404).json({ message: "No donations found" });
    }

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donations" });
  }
};

// Donate to NGO
const donateToNGO = async (req, res) => {
  try {
    const { amount, ngoId } = req.body;

    // Check if the NGO exists
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ error: "NGO not found" });
    }

    // Check the donor's wallet balance
    const wallet = await Wallet.findOne({ userId: res.locals.userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct from wallet and add the donation
    wallet.balance -= amount;
    wallet.transactions.push({ type: "donation", amount, ngoId });
    await wallet.save();

    // Create a new donation record for NGO
    const donation = new Donation({
      donorId: res.locals.userId,
      ngoId,
      amount,
      status: "Pending",
    });
    await donation.save();

    // Send SMS to the donor and NGO
    //const message = `You have donated ${amount} to the NGO ${ngo.name}. Thank you for your contribution!`;
    //await SMSService.sendSMS(res.locals.userPhone, message); // Notify the donor
    //await SMSService.sendSMS(ngo.contactNumber, `You have received a donation of ${amount} from a donor.`); // Notify the NGO

    res.status(200).json({ message: "Donation to NGO successful", donation });
  } catch (error) {
    console.error("Error donating to NGO:", error);
    res.status(500).json({ error: "Failed to donate to NGO", details: error.message });
  }
};

// Donate to Supplier
const donateToSupplier = async (req, res) => {
  try {
    const { amount, supplierId } = req.body;

    // Check if the Supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Check the donor's wallet balance
    const wallet = await Wallet.findOne({ userId: res.locals.userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct from wallet and add the donation
    wallet.balance -= amount;
    wallet.transactions.push({ type: "donation", amount, supplierId });
    await wallet.save();

    // Create a new donation record for Supplier
    const donation = new Donation({
      donorId: res.locals.userId,
      supplierId,
      amount,
      status: "Pending",
    });
    await donation.save();

    // Send SMS to the donor and Supplier
    //const message = `You have donated ${amount} to the Supplier ${supplier.name}. Thank you for your contribution!`;
    //await SMSService.sendSMS(res.locals.userPhone, message); // Notify the donor
    //await SMSService.sendSMS(supplier.contactNumber, `You have received a donation of ${amount} from a donor.`); // Notify the Supplier

    res.status(200).json({ message: "Donation to Supplier successful", donation });
  } catch (error) {
    console.error("Error donating to Supplier:", error);
    res.status(500).json({ error: "Failed to donate to Supplier", details: error.message });
  }
};


module.exports = {
  getDonorProfile,
  updateDonorProfile,
  getWallet,
  makeDonation,
  addImpacteeRequest,
  getDonationHistory,
  addWalletAmount,
  withdrawWalletAmount,
  getImpactees,
  getDonorDonations,
  donateToNGO,
  donateToSupplier,
  getAllNGOs,
  getAllSuppliers
};
