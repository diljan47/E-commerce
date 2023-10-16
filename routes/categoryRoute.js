const express = require("express");
const router = express.Router();
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getaCategory,
} = require("../controller/categoryControl");
const jwtAuth = require("../middleware/jwtauth");
const isAdmin = require("../middleware/isAdmin");

router.post("/create", jwtAuth, isAdmin, createCategory);
router.put("/:id", jwtAuth, isAdmin, updateCategory);
router.delete("/:id", jwtAuth, isAdmin, deleteCategory);
router.get("/", getAllCategory);
router.get("/:id", getaCategory);

module.exports = router;
