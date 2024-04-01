const {
  createProduct,
  updateProduct,
  getaProduct,
  getaAllProducts,
  deleteaProduct,
  ratings,
} = require("../controller/productControl");
const isAdmin = require("../middleware/isAdmin");

const router = require("express").Router();
const jwtAuth = require("../middleware/jwtauth");
const upload = require("../middleware/upload");

router.post("/create", jwtAuth, upload.array("images", 10), createProduct);
router.put("/update/:id", updateProduct);
router.get("/:id", getaProduct);
router.get("/", getaAllProducts);
router.put("/ratings", jwtAuth, ratings);
router.delete("/:id", isAdmin, deleteaProduct);

module.exports = router;
