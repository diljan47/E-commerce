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
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      return res.json("User already exists");
    }
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email });
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
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        id: findUser?._id,
        name: findUser?.name,
        email: findUser?.email,
        mobile: findUser?.mobile,
        address: findUser?.address,
        accesstoken: accessToken(findUser?._id),
        refreshToken: newrefreshToken,
      });
    } else {
      return res.json("Email or Password Incorrect!!");
    }
  } catch (error) {
    console.log(error);
  }
};

//refresh token

const refreshTokenhandler = async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    return res.status(400).json("No refresh token present in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (user) {
    jwt.verify(refreshToken, process.env.JWT_TOKEN, (err, decoded) => {
      if (err || user.id !== decoded.id) {
        return res.status(201).json("No user present in db ");
      }
      const newaccessToken = accessToken(user?.id);
      return res.status(200).json({ newaccessToken });
    });
  } else {
    return res.status(400).json("No user matched with current token");
  }
};

//User logout

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  try {
    if (!refreshToken) {
      return res.status(400).json({ error: "No Refresh Token in Cookies" });
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      res.clearCookie("refreshToken", { httpOnly: true, secure: true });
      return res.sendStatus(204);
    }

    await User.findOneAndUpdate(
      { refreshToken },
      { $set: { refreshToken: "" } }
    );
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    res.status(204).json("Success");
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
    res.status(500).json({ error: "Internal server error" });
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
    console.log(error.message);
  }
};

const getallUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    return res.json(allUsers);
  } catch (error) {
    console.log(error);
  }
};

const singleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await User.findById(id);
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

const userWishlist = async (req, res) => {
  const { id } = req.user;

  try {
    const data = await User.findById(id).populate("wishlist").exec();
    return res.status(200).json(data);
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

//Cart Control
const userCart = async (req, res) => {
  const { cart } = req.body;
  const { id } = req.user;
  try {
    validId(id, res);
    const user = await User.findById(id);
    const cartExists = await Cart.findOne({ orderby: user?._id });
    if (cartExists instanceof Cart) {
      await Cart.deleteOne({ _id: cartExists._id });
    }
    const products = await Promise.all(
      cart.map(async (item) => {
        const { prodId, count, color } = item;
        const { price } = await Products.findById(prodId)
          .select("price")
          .exec();
        return { prodId, count, color, price };
      })
    );
    const cartTotal = products.reduce(
      (total, item) => total + item.price * item.count,
      0
    );

    let finalCart = await new Cart({
      cart: products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.status(200).json(finalCart);
  } catch (error) {
    console.log(error);
  }
};

const getUserCart = async (req, res) => {
  const { id } = req.user;
  try {
    validId(id, res);
    const userCart = await Cart.findOne({ orderby: id });
    if (!userCart) {
      return res.status(200).json("Cart Empty");
    }
    res.status(200).json({ total: userCart.cart.length, userCart });
  } catch (error) {
    console.log(error);
  }
};

const emptyCart = async (req, res) => {
  const { id } = req.user;
  try {
    validId(id, res);
    const user = await User.findById(id);
    const userCart = await Cart.findOneAndDelete({ orderby: user._id });
    res.status(200).json(userCart);
  } catch (error) {
    console.log(error);
  }
};

//Create Order

const createOrder = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id);
    const userCart = await Cart.findOne({ orderby: user._id });

    const orderExists = await Order.findOne({ orderBy: user._id });
    if (orderExists instanceof Order) {
      await Order.deleteOne({ _id: orderExists._id });
    }

    let newOrder = await new Order({
      products: userCart.cart,
      paymentMethod: {
        id: uniqid(),
        method: "",
        amount: userCart.cartTotal,
        status: "Payment Gateway",
        created: Date.now(),
        currency: "INR",
      },
      orderStatus: "Order Creation",
      orderBy: user?._id,
    }).save();

    //update quantity and count on Productdb
    let update = userCart.cart.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.prodId },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });

    await Products.bulkWrite(update, {});
    res.status(200).json("Success");
  } catch (error) {
    console.log(error);
  }
};

const getOrders = async (req, res) => {
  const { id } = req.user;
  try {
    validId(id, res);
    const userOrders = await Order.findOne({ orderBy: id })
      .populate("products")
      .populate("orderBy")
      .exec();
    res.status(200).json(userOrders);
  } catch (error) {
    console.log(error);
  }
};

const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find().populate("products").exec();
    res.status(200).json(allOrders);
  } catch (error) {
    console.log(error);
  }
};

const getOrderByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    validId(id, res);
    const userOrders = await Order.findOne({ orderBy: id });
    res.status(200).json(userOrders);
  } catch (error) {
    console.log(error);
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
      },

      { new: true }
    );
    res.status(200).json(updatedOrderStatus);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
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
};
