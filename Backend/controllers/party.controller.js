const Party = require('../MongoDb/models/userModels/Party');

// Add Party Function
const AddParty = async (req, res) => {
  try {
    const partyData = req.body;
    const newParty = new Party(partyData);
    await newParty.save();
    res.status(201).json({
      success: true,
      message: 'Party added successfully',
      data: newParty
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
    const parties = await Party.find();
    res.status(200).json({
      success: true,
      message: 'Parties retrieved successfully',
      data: parties
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
