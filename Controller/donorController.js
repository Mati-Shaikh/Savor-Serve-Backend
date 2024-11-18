const User = require("../models/User.schema");
const Wallet = require("../models/Wallet.Schema");
const Donation = require("../models/Donation.Schema");
const ImpacteeRequest = require("../models/Impactee.Schema");

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
      const wallet = await Wallet.findOne({ userId: res.locals.userId }); // Use res.locals.userId
  
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance or wallet not found." });
      }
  
      wallet.balance -= amount;
      wallet.transactions.push({ type: "donation", amount });
      await wallet.save();
  
      const donation = new Donation({ donorId: res.locals.userId, impacteeId, amount }); // Use res.locals.userId
      await donation.save();
  
      res.status(200).json({ message: "Donation successful." });
    } catch (error) {
      console.error("Error making donation:", error);
      res.status(500).json({ error: "Failed to make donation." });
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
};
