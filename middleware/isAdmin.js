const User = require("../models/usermodel");

const isAdmin = async (req, res, next) => {
  const { id } = req.user;
  try {
    const checkAdmin = await User.findById(id);
    if (checkAdmin.role !== "admin") {
      console.log("User ID:", id);
      console.log("User Role:", checkAdmin.role);
      return res.status(401).json("Unauthorized: You are not an Admin!");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error");
  }
};

module.exports = isAdmin;
