const Category = require("../MongoDb/models/userModels/Category");

// Category Apis
exports.AddCategory = async (req, res) => {
    console.log("Received Add Category Request:", req.body); // ✅ Log incoming request

    const { category } = req.body;
    if (!category) {
        console.error("Error: Category is missing");
        return res.status(400).json({ message: "Category is required" });
    }

    try {
        console.log("Checking if category already exists...");
        const existingCategory = await Category.findOne({ category });
        if (existingCategory) {
            console.warn("Category already exists:", existingCategory);
            return res.status(400).json({ message: "Category already exists" });
        }

        console.log("Saving new category...");
        const newCategory = new Category({ category });
        await newCategory.save();
        console.log("Category added successfully:", newCategory);

        res.status(201).json({ message: "Category added successfully", newCategory: newCategory });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Error adding category", error: error.message });
    }
};

exports.getCategory = async (req, res) => {
    try {
        console.log("Fetching all categories...");
        const categories = await Category.find({});
        console.log("Fetched Categories:", categories);
        res.status(200).json({ category: categories }); // ✅ Ensure correct response key
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};