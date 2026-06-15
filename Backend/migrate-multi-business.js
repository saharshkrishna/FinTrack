const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Business = require('./MongoDb/models/userModels/Business');
const User = require('./MongoDb/models/userModels/User');
const Transaction = require('./MongoDb/models/userModels/Transaction');
const Party = require('./MongoDb/models/userModels/Party');
const Category = require('./MongoDb/models/userModels/Category');
const PaymentMode = require('./MongoDb/models/userModels/Payment');
const Loan = require('./MongoDb/models/userModels/Loan');
const LoanRe = require('./MongoDb/models/userModels/LoanRe');

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintrack');

    // Step 1: Get an existing user
    const existingUser = await User.findOne({});
    if (!existingUser) {
      console.log('No users found in database. Nothing to migrate.');
      await mongoose.disconnect();
      return;
    }

    console.log('Found existing user:', existingUser.email);

    // Step 2: Create a default business for existing data
    const defaultBusiness = await Business.create({
      name: 'Default Business',
      owner: existingUser._id,
      currency: 'INR'
    });
    console.log('Created default business:', defaultBusiness._id);

    // Step 3: Link business to user
    await User.findByIdAndUpdate(existingUser._id, {
      $push: { businesses: defaultBusiness._id }
    });

    // Step 4: Stamp all existing documents with the new businessId
    const businessId = defaultBusiness._id;

    await Transaction.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    await Party.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    await Category.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    await PaymentMode.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    await Loan.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    await LoanRe.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });

    console.log('Migration complete. All existing records associated with businessId:', businessId);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

migrate();
