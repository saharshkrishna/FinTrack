const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    category: { type: String, unique: true, required: true }
  });

  const Category = mongoose.model("Category", CategorySchema);

  module.exports = Category;