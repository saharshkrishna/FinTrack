const express = require("express");
const router = express.Router();
const { AddCategory, getCategory } = require("../controller/category.controller");

router.post("/", AddCategory);
router.get("/", getCategory);

module.exports = router;
