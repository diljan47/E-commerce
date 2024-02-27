const router = require("express").Router();

const {
  createUser,
  loginUser,
  updateUser,
  userAddress,
  singleUser,
  getallUsers,
  deleteaUser,
  updatePassword,
  refreshTokenhandler,
  userWishlist,
  adminLogin,
  userCart,
  getUserCart,
  emptyCart,
  createOrder,
  getOrders,
  getAllOrders,
  getOrderByUserId,
  updateOrderStatus,
  logout,
  removeAProductCart,
  updateQuantityFromCart,
} = require("../controller/userControl");
const isAdmin = require("../middleware/isAdmin");
const jwtAuth = require("../middleware/jwtauth");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/admin-login", adminLogin);
router.post("/cart", jwtAuth, userCart); //2
router.get("/all-users", getallUsers);
router.get("/refresh", refreshTokenhandler);
router.get("/", jwtAuth, getUserCart); //1
router.get("/get-orders", jwtAuth, getOrders);
router.get("/wishlist", jwtAuth, userWishlist);
router.post("/logout", logout);
//
router.get("/all-orders", jwtAuth, isAdmin, getAllOrders);
router.post("/all-orders/:id", jwtAuth, isAdmin, getOrderByUserId);
//
router.get("/:id", jwtAuth, singleUser);
router.put("/user-edit", jwtAuth, updateUser);
router.put("/order-status/:id", jwtAuth, isAdmin, updateOrderStatus);
router.put("/user-address", jwtAuth, userAddress);
router.put("/update-password", jwtAuth, updatePassword);
router.put("/update-usercart/", jwtAuth, updateQuantityFromCart);

router.delete("/delete/:id", jwtAuth, isAdmin, deleteaUser);
router.delete("/delete-product/:id", jwtAuth, removeAProductCart);

router.delete("/empty-cart", jwtAuth, emptyCart);
router.post("/order", jwtAuth, createOrder);

module.exports = router;
