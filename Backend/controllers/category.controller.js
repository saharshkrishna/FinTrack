const Category = require("../MongoDb/models/userModels/Category");

// Category Apis
exports.AddCategory = async (req, res) => {
    console.log("Received Add Category Request:", req.body);

    const { category } = req.body;
    if (!category) {
        console.error("Error: Category is missing");
        return res.status(400).json({ message: "Category is required" });
    }

    try {
        console.log("Checking if category already exists...");
        const existingCategory = await Category.findOne({ category, businessId: req.businessId });
        if (existingCategory) {
            console.warn("Category already exists:", existingCategory);
            return res.status(400).json({ message: "Category already exists" });
        }

        console.log("Saving new category...");
        const newCategory = new Category({ category, businessId: req.businessId });
        await newCategory.save();
        console.log("Category added successfully:", newCategory);

        res.status(201).json({ message: "Category added successfully", newCategory: newCategory, category: newCategory });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Error adding category", error: error.message });
    }
};

exports.getCategory = async (req, res) => {
    try {
        console.log("Fetching all categories...");
        const categories = await Category.find({ businessId: req.businessId });
        console.log("Fetched Categories:", categories);
        res.status(200).json({ category: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const updatedCategory = await Category.findOneAndUpdate(
            { _id: id, businessId: req.businessId },
            { category },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Category.findOneAndDelete({ _id: id, businessId: req.businessId });

        if (!deleted) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
};