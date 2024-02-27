const express = require("express");
const router = express.Router();
const {
  createColor,
  updateColor,
  deleteColor,
  getallColors,
  getColor,
} = require("../controller/colorControl");

router.post("/", createColor);
router.put("/:id", updateColor);
router.delete("/:id", deleteColor);
router.get("/:id", getColor);
router.get("/", getallColors);

module.exports = router;
