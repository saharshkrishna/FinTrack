const Business = require('../MongoDb/models/userModels/Business');
const User = require('../MongoDb/models/userModels/User');
const PaymentMode = require('../MongoDb/models/userModels/Payment');
const Category = require('../MongoDb/models/userModels/Category');
const Transaction = require('../MongoDb/models/userModels/Transaction');
const Party = require('../MongoDb/models/userModels/Party');
const Loan = require('../MongoDb/models/userModels/Loan');
const LoanRe = require('../MongoDb/models/userModels/LoanRe');

// Generate readable code like BIZ-8K2PQ
const generateBusinessCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BIZ-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new business
exports.createBusiness = async (req, res) => {
  try {
    const { name, currency, description, companyType, gstNumber, teamAccessCount, teamMembers } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let processedTeamMembers = [];
    if (Array.isArray(teamMembers)) {
      processedTeamMembers = teamMembers
        .map(em => (typeof em === 'string' ? em : em?.email || '').trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 3)
        .map(email => ({ email, role: 'Member', addedAt: new Date() }));
    }

    const trimmedName = name.trim();
    const newBusiness = await Business.create({
      businessId: generateBusinessCode(),
      name: trimmedName,
      owner: user._id,
      userId: user._id,
      companyType: companyType?.trim() || '',
      gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : '',
      teamAccessCount: processedTeamMembers.length || Math.min(Number(teamAccessCount) || 0, 3),
      teamMembers: processedTeamMembers,
      currency: currency?.trim() || 'INR',
      description: description?.trim() || '',
    });

    // Link business to user
    user.businesses.push(newBusiness._id);
    await user.save();

    // Seed default payment modes (safe/isolated)
    try {
      const defaultPaymentModes = ['Cash', 'Online', 'UPI', 'Bank Transfer', 'Card'];
      await PaymentMode.insertMany(
        defaultPaymentModes.map((mode) => ({
          businessId: newBusiness._id,
          paymentMode: mode,
        })),
        { ordered: false }
      );
    } catch (seedErr) {
      console.warn('Payment modes default seeding warning:', seedErr.message);
    }

    // Seed default categories (safe/isolated)
    try {
      const defaultCategories = ['Sales', 'Supplies', 'Services', 'Utilities', 'General'];
      await Category.insertMany(
        defaultCategories.map((cat) => ({
          businessId: newBusiness._id,
          category: cat,
        })),
        { ordered: false }
      );
    } catch (seedErr) {
      console.warn('Categories default seeding warning:', seedErr.message);
    }

    // Fetch updated businesses list
    const updatedUser = await User.findById(user._id).populate('businesses');

    res.status(201).json({
      message: 'Business created successfully',
      business: newBusiness,
      businesses: updatedUser.businesses,
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Failed to create business', details: error.message });
  }
};

// Get all businesses of current user
exports.getBusinesses = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('businesses');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ businesses: user.businesses || [] });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses', details: error.message });
  }
};

// Update business details
exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, currency, description, companyType, gstNumber, teamMembers, teamAccessCount } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ownsBusiness = user.businesses.some((bId) => bId.toString() === id);
    if (!ownsBusiness) {
      return res.status(403).json({ error: 'Not authorized to modify this business' });
    }

    const updateFields = {};
    if (name && name.trim()) updateFields.name = name.trim();
    if (currency) updateFields.currency = currency.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (companyType !== undefined) updateFields.companyType = companyType.trim();
    if (gstNumber !== undefined) updateFields.gstNumber = gstNumber.trim().toUpperCase();

    if (Array.isArray(teamMembers)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanMembers = teamMembers
        .map(em => (typeof em === 'string' ? em : em?.email || '').trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 3);

      for (const mEmail of cleanMembers) {
        if (!emailRegex.test(mEmail)) {
          return res.status(400).json({ error: `Invalid team member Gmail/email: ${mEmail}` });
        }
      }

      updateFields.teamMembers = cleanMembers.map(email => ({
        email,
        role: 'Member',
        addedAt: new Date()
      }));
      updateFields.teamAccessCount = cleanMembers.length;

      // Link business to any registered users with these emails
      if (cleanMembers.length > 0) {
        await User.updateMany(
          { email: { $in: cleanMembers } },
          { $addToSet: { businesses: id } }
        );
      }
    } else if (teamAccessCount !== undefined) {
      updateFields.teamAccessCount = Math.min(Number(teamAccessCount) || 0, 3);
    }

    const updated = await Business.findByIdAndUpdate(id, updateFields, { new: true });
    const updatedUser = await User.findById(user._id).populate('businesses');

    res.status(200).json({
      message: 'Business updated successfully',
      business: updated,
      businesses: updatedUser.businesses
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business', details: error.message });
  }
};

// Delete business and all its related data
exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ownsBusiness = user.businesses.some((bId) => bId.toString() === id);
    if (!ownsBusiness) {
      return res.status(403).json({ error: 'Not authorized to delete this business' });
    }

    // Cascade delete all child documents for this business
    await Transaction.deleteMany({ businessId: id });
    await Category.deleteMany({ businessId: id });
    await PaymentMode.deleteMany({ businessId: id });
    await Party.deleteMany({ businessId: id });
    await Loan.deleteMany({ businessId: id });
    await LoanRe.deleteMany({ businessId: id });
    await Business.findByIdAndDelete(id);

    // Remove from user's businesses
    user.businesses = user.businesses.filter((bId) => bId.toString() !== id);
    await user.save();

    // If no businesses left, auto-create a default one so user is never empty
    let activeBiz = null;
    if (user.businesses.length === 0) {
      const defaultBiz = await Business.create({
        businessId: generateBusinessCode(),
        name: `${user.name}'s Business`,
        owner: user._id,
        userId: user._id,
        currency: 'INR'
      });
      user.businesses.push(defaultBiz._id);
      await user.save();
      activeBiz = defaultBiz;
    }

    const updatedUser = await User.findById(user._id).populate('businesses');

    res.status(200).json({
      message: 'Business deleted successfully',
      businesses: updatedUser.businesses,
      activeBusiness: activeBiz || updatedUser.businesses[0]
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business', details: error.message });
  }
};
