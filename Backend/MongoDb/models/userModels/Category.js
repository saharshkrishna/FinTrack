const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    category: { type: String, required: true }
  });

  CategorySchema.index({ businessId: 1, category: 1 }, { unique: true });

  const Category = mongoose.model("Category", CategorySchema);

  module.exports = Category;