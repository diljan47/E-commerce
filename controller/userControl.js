const User = require("../models/usermodel");
const Products = require("../models/productModel");
const Order = require("../models/orderModel");
const validId = require("../config/mongoIDvalidate");
const bcrypt = require("bcrypt");
const { accessToken } = require("../config/accessToken");
const { createrefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const Cart = require("../models/cartModel");
const uniqid = require("uniqid");

const createUser = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json("User with this email already exists");
      }
      if (existingUser.mobile === mobile) {
        return res
          .status(400)
          .json("User with this mobile number already exists");
      }
    }
    const newUser = await User.create(req.body);
    return res.status(200).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal Server Error");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(400).json("Email does not Exist");
    }
    await findUser.isPassMatch(password);
    if (findUser && (await findUser.isPassMatch(password))) {
      const newrefreshToken = await createrefreshToken(findUser?._id);
      const updatedToken = await User.findByIdAndUpdate(
        findUser?._id,
        {
          refreshToken: newrefreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        id: findUser?._id,
        name: findUser?.name,
        email: findUser?.email,
        mobile: findUser?.mobile,
        address: findUser?.address,
        token: accessToken(findUser?._id),
      });
    } else {
      return res.status(400).json("Email or Password Incorrect!!");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

//refresh token

const refreshTokenhandler = async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    return res.status(403).json("No refresh token present in cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res
      .status(403)
      .json({ error: "No user matched with current cookie" });
  }
  if (user) {
    jwt.verify(refreshToken, process.env.JWT_TOKEN, (err, decoded) => {
      if (err || user.id !== decoded.id) {
        return res.status(403).json("No user present in db ");
      }
      const newaccessToken = accessToken(user?.id);
      return res.status(200).json({
        newaccessToken,
        name: user?.name,
        email: user?.email,
        mobile: user?.mobile,
      });
    });
  } else {
    return res.status(403).json({ error: "Something wrong with cookies" });
  }
};

//User logout

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  try {
    if (!refreshToken) {
      return res.status(403).json({ error: "No Refresh Token in Cookies" });
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      res.clearCookie("refreshToken", { httpOnly: true, secure: true });
      return res.status(204).json("User Not Found Cookie Cleared!");
    }

    await User.findOneAndUpdate(
      { refreshToken },
      { $set: { refreshToken: "" } }
    );
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    res.status(200).json("Success");
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  const { id } = req.user;

  try {
    validId(id, res);
    const idMatched = await User.findByIdAndUpdate(
      id,
      {
        name: req.body?.name,
        email: req.body?.email,
        mobile: req.body?.mobile,
      },
      { new: true }
    );
    if (!idMatched) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(idMatched);
  } catch (error) {
    console.log(error.message);
    res.status(500).json("Internal server error");
  }
};

const userAddress = async (req, res) => {
  try {
    const { id } = req.user;

    const newAddress = await User.findByIdAndUpdate(
      id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(newAddress);
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

const getallUsers = async (req, res) => {
  try {
    const allUsers = await User.find().populate("cart").exec();
    return res.json(allUsers);
  } catch (error) {
    console.log(error);
  }
};

const singleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await User.findById(id).populate("cart").exec();
    res.json(userData);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteaUser = async (req, res) => {
  const { id } = req.user;
  try {
    validId(id, res);
    const userData = await User.findByIdAndDelete(id);
    if (!userData) {
      return res.status(201).json({ message: "User id not found" });
    }
    res.status(200).json("user deleted");
  } catch (error) {
    console.log(error.message);
  }
};
//updatePassword
const updatePassword = async (req, res) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    validId(id, res);
    const userMod = await User.findById(id);
    if (!userMod) {
      return res.json("User not found");
    }
    const passComp = await userMod.isPassMatch(oldPassword);
    if (!passComp) {
      return res.status(201).json("Old password does not match");
    }
    userMod.password = newPassword;
    const updatedPass = await userMod.save();
    return res
      .status(200)
      .json({ message: "New Password", data: updatedPass.password });
  } catch (error) {
    console.log(error);
  }
};

const createForgotPassToken = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json("User with this email not found");
    }
    const token = await user.createPassResetToken();
    return res.json(token);
  } catch (error) {
    console.log(error);
  }
};

const resetPasswordFromMail = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    if (!token) {
      return res.status(400).json("Link Expired Or Not Found");
    }
    const user = await User.findOne({
      "passwordResetToken.token": token,
      "passwordResetToken.expirationTime": { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json("Link Expired Or Invalid");
    }
    user.password = password;
    user.passwordResetToken = undefined;
    await user.save();
    return res.status(200).json("Password Updated");
  } catch (error) {
    console.log(error);
  }
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== "admin") {
      return res.status(201).json("You are not an Admin!!");
    }
    if (findAdmin && (await findAdmin.isPassMatch(password))) {
      const newrefreshToken = createrefreshToken(findAdmin?._id);
      await User.findByIdAndUpdate(
        findAdmin?._id,
        {
          refreshToken: newrefreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        id: findAdmin?._id,
        name: findAdmin?.name,
        email: findAdmin?.email,
        mobile: findAdmin?.mobile,
        accesstoken: accessToken(findAdmin?._id),
        refreshToken: newrefreshToken,
      });
    } else {
      return res.json("Email or Password Incorrect!!");
    }
  } catch (error) {
    console.log(error);
  }
};
const userWishlist = async (req, res) => {
  const { id } = req.user;

  try {
    const data = await User.findById(id).populate("wishlist").exec();
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
};
// const addtoWishList = async (req, res) => {
//   const { id } = req.user;
//   const { prodId } = req.body;
//   try {
//     const user = await User.findById(id);
//     const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
//     console.log(alreadyAdded);
//     if (alreadyAdded) {
//       console.log(`Removing ${prodId} from wishlist`);
//       let updatedUser = await User.findByIdAndUpdate(
//         id,
//         {
//           $pull: { wishlist: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       console.log("User after removing:", updatedUser);
//       res.json(updatedUser);
//     } else {
//       console.log(`Adding ${prodId} to wishlist`);
//       let updatedUser = await User.findByIdAndUpdate(
//         id,
//         {
//           $push: { wishlist: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       console.log("User after adding:", updatedUser);
//       res.json(updatedUser);
//     }
//   } catch (error) {
//     console.log("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const addtoWishList = async (req, res) => {
  const { id } = req.user;
  const { prodId } = req.body;

  try {
    const user = await User.findById(id);
    const alreadyAddedIndex = user.wishlist.findIndex(
      (itemId) => itemId.toString() === prodId
    );
    if (alreadyAddedIndex !== -1) {
      // Remove the old product ID from the wishlist
      user.wishlist.splice(alreadyAddedIndex, 1);
    }
    user.wishlist.push(prodId);
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Cart Control
const userCart = async (req, res) => {
  const { productId, color, quantity, price } = req.body;
  const { id } = req.user;
  try {
    validId(id, res);
    let finalCart = await new Cart({
      userId: id,
      productId,
      color,
      price,
      quantity,
    }).save();
    res.status(200).json(finalCart);

    //
    const pushToUser = await User.findByIdAndUpdate(id, {
      $push: { cart: finalCart._id },
    });
  } catch (error) {
    console.log(error);
  }
};

const getUserCart = async (req, res) => {
  const { id } = req.user;
  try {
    validId(id, res);
    const userCart = await Cart.find({ userId: id })
      .populate("productId")
      .populate("color")
      .exec();
    if (!userCart) {
      return res.status(200).json("Cart Empty");
    }
    return res.status(200).json(userCart);
  } catch (error) {
    console.log(error);
  }
};

const removeAProductCart = async (req, res) => {
  const { id } = req.user;
  try {
    validId(id, res);

    const result = await Cart.findOneAndDelete({
      userId: id,
      productId: req.params?.id,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(400).json("Something went wrong");
  }
};

const updateQuantityFromCart = async (req, res) => {
  const { id } = req.user;
  const { prodId, newQuantity } = req.body;
  try {
    validId(id, res);
    const userCart = await Cart.findOne({ userId: id, productId: prodId });
    userCart.quantity = newQuantity;
    userCart.save();
    return res.status(200).json(userCart);
  } catch (error) {
    console.log(error);
  }
};

const emptyCart = async (req, res) => {
  const { id } = req.user;
  try {
    validId(id, res);
    const user = await User.findById(id);
    const userCart = await Cart.findOneAndDelete({ userId: user._id });
    res.status(200).json(userCart);
  } catch (error) {
    console.log(error);
  }
};

//Create Order

const createOrder = async (req, res) => {
  const { id } = req.user;
  const { shippingInfo, paymentInfo, orderProducts, totalAmount } = req.body;
  try {
    validId(id, res);
    const result = await Order.create({
      orderBy: id,
      shippingInfo,
      paymentInfo,
      orderProducts,
      totalAmount,
    });
    await result.save();
    return res.status(200).json({ result, success: true });
  } catch (error) {
    console.log(error);
  }
};

const getOrders = async (req, res) => {
  const { id } = req.user;
  try {
    validId(id, res);
    const userOrders = await Order.find({ orderBy: id })
      .populate("orderBy")
      .populate("orderProducts.color")
      .populate("orderProducts.product")
      .exec();
    res.status(200).json(userOrders);
  } catch (error) {
    console.log(error);
  }
};

// const getAllOrders = async (req, res) => {
//   try {
//     const allOrders = await Order.find().populate("products").exec();
//     res.status(200).json(allOrders);
//   } catch (error) {
//     console.log(error);
//   }
// };

// const getOrderByUserId = async (req, res) => {
//   const { id } = req.params;
//   try {
//     validId(id, res);
//     const userOrders = await Order.findOne({ orderBy: id });
//     res.status(200).json(userOrders);
//   } catch (error) {
//     console.log(error);
//   }
// };

// const updateOrderStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;
//   try {
//     const updatedOrderStatus = await Order.findByIdAndUpdate(
//       id,
//       {
//         orderStatus: status,
//       },

//       { new: true }
//     );
//     res.status(200).json(updatedOrderStatus);
//   } catch (error) {
//     console.log(error);
//   }
// };

module.exports = {
  createUser,
  loginUser,
  updateUser,
  userAddress,
  singleUser,
  getallUsers,
  deleteaUser,
  updatePassword,
  createForgotPassToken,
  resetPasswordFromMail,
  refreshTokenhandler,
  userWishlist,
  addtoWishList,
  adminLogin,
  removeAProductCart,
  updateQuantityFromCart,
  userCart,
  getUserCart,
  emptyCart,
  createOrder,
  getOrders,
  // getAllOrders,
  // getOrderByUserId,
  // updateOrderStatus,
  logout,
};
