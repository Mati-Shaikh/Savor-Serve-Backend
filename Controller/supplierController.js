const Supplier = require('../models/Supplier.Schema');

// Supplier Registration
const registerSupplier = async (req, res) => {
  try {
    const { storeName, contactNumber, address, bankDetails } = req.body;

    const newSupplier = new Supplier({
      userId: res.locals.userId,  // assuming user ID from authentication
      storeName,
      contactNumber,
      address,
      bankDetails,
    });

    await newSupplier.save();
    res.status(201).json({ message: 'Supplier registered successfully', supplier: newSupplier });
  } catch (error) {
    res.status(500).json({ error: 'Error registering supplier', details: error.message });
  }
};
// Update store details
const updateStoreDetails = async (req, res) => {
    try {
      const { storeName, contactNumber, address, isStoreVisible } = req.body;
  
      const updatedSupplier = await Supplier.findOneAndUpdate(
        { userId: res.locals.userId },
        { storeName, contactNumber, address, isStoreVisible },
        { new: true }
      );
  
      if (!updatedSupplier) return res.status(404).json({ error: 'Supplier not found' });
  
      res.status(200).json({ message: 'Store details updated', supplier: updatedSupplier });
    } catch (error) {
      res.status(500).json({ error: 'Error updating store details', details: error.message });
    }
  };
  
  

module.exports = { registerSupplier , updateStoreDetails};
