const express = require("express");
const router = express.Router();
const { AddCategory, getCategory } = require("../controllers/category.controller");
router.post("/", AddCategory);
router.get("/", getCategory);
module.exports = router;
