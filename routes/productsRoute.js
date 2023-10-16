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

router.post("/create", jwtAuth, isAdmin, createProduct);
router.put("/update/:id", jwtAuth, isAdmin, updateProduct);
router.get("/:id", getaProduct);
router.get("/", getaAllProducts);
router.put("/wishlist", jwtAuth, addtoWishList);
router.put("/ratings", jwtAuth, ratings);
router.delete("/:id", isAdmin, deleteaProduct);

module.exports = router;
