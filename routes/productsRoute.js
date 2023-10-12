const {
  createProduct,
  updateProduct,
  getaProduct,
  getaAllProducts,
  deleteaProduct,
  addtoWishList,
  ratings,
} = require("../controller/productControl");

const router = require("express").Router();
const jwtAuth = require("../middleware/jwtauth");

router.post("/create", createProduct);
router.put("/update/:id", updateProduct);
router.get("/:id", getaProduct);
router.get("/", getaAllProducts);
router.put("/wishlist", jwtAuth, addtoWishList);
router.put("/ratings", jwtAuth, ratings);
router.delete("/:id", deleteaProduct);

module.exports = router;
