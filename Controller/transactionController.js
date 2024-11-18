const Transaction = require('../models/transactionModel');

// Add Transaction History
const addTransaction = async (req, res) => {
  try {
    const { voucherId, amount, receiptImage } = req.body;

    const newTransaction = new Transaction({
      voucherId,
      supplierId: res.locals.userId,  // assuming supplier is logged in
      amount,
      receiptImage,
    });

    await newTransaction.save();
    res.status(201).json({ message: 'Transaction added successfully', transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ error: 'Error adding transaction', details: error.message });
  }
};

// Get Transaction History
const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ supplierId: res.locals.userId })
      .populate('voucherId')
      .sort({ transactionDate: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transaction history', details: error.message });
  }
};

module.exports = { addTransaction, getTransactionHistory };
