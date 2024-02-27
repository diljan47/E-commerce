const {
  createProduct,
  updateProduct,
  getaProduct,
  getaAllProducts,
  deleteaProduct,
  addtoWishList,
  ratings,
} = require("../controller/productControl");
const isAdmin = require("../middleware/isAdmin");

const router = require("express").Router();
const jwtAuth = require("../middleware/jwtauth");
const upload = require("../middleware/upload");

router.post("/create", jwtAuth, upload.array("images", 10), createProduct);
router.put("/update/:id", jwtAuth, isAdmin, updateProduct);
router.get("/:id", getaProduct);
router.get("/", getaAllProducts);
router.put("/wishlist", jwtAuth, addtoWishList);
router.put("/ratings", jwtAuth, ratings);
router.delete("/:id", isAdmin, deleteaProduct);

module.exports = router;
