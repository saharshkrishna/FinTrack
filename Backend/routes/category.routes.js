const express = require("express");
const router = express.Router();
const { AddCategory, getCategory, updateCategory, deleteCategory } = require("../controllers/category.controller");

router.post("/", AddCategory);
router.get("/", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
