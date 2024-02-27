const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
      },
    ],
    address: {
      type: String,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userModel.pre("save", async function (next) {
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userModel.methods.isPassMatch = async function (isPassword) {
  return await bcrypt.compare(isPassword, this.password);
};

module.exports = mongoose.model("User", userModel);
