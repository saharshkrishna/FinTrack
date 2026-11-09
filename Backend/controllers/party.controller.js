const Party = require('../MongoDb/models/userModels/Party');
const Transaction = require('../MongoDb/models/userModels/Transaction');

// Add Party Function
const AddParty = async (req, res) => {
  try {
    const { partyName, phone, partyType } = req.body;

    if (!partyName || partyName.trim() === "") {
      return res.status(400).json({ message: "Enter the required fields" });
    }

    const existingParty = await Party.findOne({ partyName: partyName.trim(), businessId: req.businessId });
    if (existingParty) {
      return res.status(400).json({ message: "Party already exists" });
    }

    const newParty = new Party({
      businessId: req.businessId,
      partyName: partyName.trim(),
      phone: phone || "",
      partyType,
    });

    await newParty.save();
    
    res.status(201).json({
      success: true,
      message: 'Party added successfully',
      party: newParty,
      partyName: newParty.partyName
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding party',
      error: error.message
    });
  }
};

// Get Party Function
const getParty = async (req, res) => {
  try {
    let parties = await Party.find({ businessId: req.businessId });

    // Auto-sync any distinct party names from transactions for this business
    try {
      const txParties = await Transaction.distinct("partyName", {
        businessId: req.businessId,
        partyName: { $nin: ["", null] }
      });

      if (txParties && txParties.length > 0) {
        const existingNames = new Set(parties.map(p => (p.partyName || '').trim().toLowerCase()));
        const missingParties = txParties
          .map(p => (p ? String(p).trim() : ''))
          .filter(p => p && !existingNames.has(p.toLowerCase()));

        if (missingParties.length > 0) {
          const toInsert = missingParties.map(pName => ({
            businessId: req.businessId,
            partyName: pName,
            partyType: "Supplier"
          }));
          await Party.insertMany(toInsert, { ordered: false });
          parties = await Party.find({ businessId: req.businessId });
        }
      }
    } catch (syncErr) {
      console.warn("Error syncing transaction parties:", syncErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Parties retrieved successfully',
      parties: parties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving parties',
      error: error.message
    });
  }
};

// Update Party Function
const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { partyName, phone, partyType } = req.body;

    const updatedParty = await Party.findOneAndUpdate(
      { _id: id, businessId: req.businessId },
      { partyName: partyName?.trim(), phone, partyType },
      { new: true, runValidators: true }
    );

    if (!updatedParty) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Party updated successfully',
      party: updatedParty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating party',
      error: error.message
    });
  }
};

// Delete Party Function
const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Party.findOneAndDelete({ _id: id, businessId: req.businessId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }

    res.status(200).json({ success: true, message: 'Party deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting party',
      error: error.message
    });
  }
};


module.exports = {
  AddParty,
  getParty,
  updateParty,
  deleteParty
};
