const User = require("../models/usermodel");
const validId = require("../config/mongoIDvalidate");
const bcrypt = require("bcrypt");
const { accessToken } = require("../config/accessToken");
const { createrefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");

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
  const { id } = req.user;
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
    const data = await User.findById(id).populate("wishlist");
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
};

// that req.user is coming from jwttoken verified takes in mongodb id to create a token and passed onto req.user
//do jwttoken next
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
};
