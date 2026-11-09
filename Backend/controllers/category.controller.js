const Category = require("../MongoDb/models/userModels/Category");
const Transaction = require("../MongoDb/models/userModels/Transaction");

const DEFAULT_CATEGORIES = [
  'Sales', 'Purchase', 'Rent', 'Utilities', 'Salary', 'Marketing', 'Office Supplies', 'Others'
];

// Category Apis
exports.AddCategory = async (req, res) => {
    console.log("Received Add Category Request:", req.body);

    const { category } = req.body;
    if (!category || !String(category).trim()) {
        console.error("Error: Category is missing");
        return res.status(400).json({ message: "Category is required" });
    }

    const trimmedCategory = String(category).trim();

    try {
        console.log("Checking if category already exists...");
        const existingCategory = await Category.findOne({
            businessId: req.businessId,
            category: { $regex: new RegExp(`^${trimmedCategory}$`, 'i') }
        });
        if (existingCategory) {
            console.warn("Category already exists:", existingCategory);
            return res.status(200).json({ message: "Category already exists", category: existingCategory });
        }

        console.log("Saving new category...");
        const newCategory = new Category({ category: trimmedCategory, businessId: req.businessId });
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
        let categories = await Category.find({ businessId: req.businessId });

        // Auto-sync any categories present in transactions for this business
        try {
            const txCategories = await Transaction.distinct("category", {
                businessId: req.businessId,
                category: { $nin: ["", null] }
            });

            if (txCategories && txCategories.length > 0) {
                const existingNames = new Set(categories.map(c => (c.category || '').trim().toLowerCase()));
                const missingCats = txCategories
                    .map(c => (c ? String(c).trim() : ''))
                    .filter(c => c && !existingNames.has(c.toLowerCase()));

                if (missingCats.length > 0) {
                    const toInsert = missingCats.map(cat => ({
                        businessId: req.businessId,
                        category: cat
                    }));
                    await Category.insertMany(toInsert, { ordered: false });
                    categories = await Category.find({ businessId: req.businessId });
                }
            }
        } catch (syncErr) {
            console.warn("Error syncing transaction categories:", syncErr.message);
        }

        // If business still has zero categories, seed default categories
        if (!categories || categories.length === 0) {
            try {
                const toInsert = DEFAULT_CATEGORIES.map(cat => ({
                    businessId: req.businessId,
                    category: cat
                }));
                await Category.insertMany(toInsert, { ordered: false });
                categories = await Category.find({ businessId: req.businessId });
            } catch (seedErr) {
                console.warn("Error seeding default categories:", seedErr.message);
            }
        }

        res.status(200).json({ category: categories, categories });
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