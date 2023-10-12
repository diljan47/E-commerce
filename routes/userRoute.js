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
} = require("../controller/userControl");
const jwtAuth = require("../middleware/jwtauth");

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/all-users/", getallUsers);
router.get("/refresh", refreshTokenhandler);
router.get("/single", jwtAuth, singleUser);
router.get("/wishlist", jwtAuth, userWishlist);
router.put("/user-edit", jwtAuth, updateUser);
router.put("/user-address", jwtAuth, userAddress);
router.put("/update-password", jwtAuth, updatePassword);
router.delete("/delete-user", jwtAuth, deleteaUser);

module.exports = router;
