const Party = require('../MongoDb/models/userModels/Party');

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
    const parties = await Party.find({ businessId: req.businessId });
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

module.exports = {
  AddParty,
  getParty
};
