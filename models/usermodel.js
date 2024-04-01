const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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
    passwordResetToken: {
      token: {
        type: String,
      },
      expirationTime: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

userModel.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  return next();
});

userModel.methods.isPassMatch = async function (isPassword) {
  const result = await bcrypt.compare(isPassword, this.password);
  return result;
};

userModel.methods.createPassResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const cryptoToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000);
  this.passwordResetToken = {
    token: cryptoToken,
    expirationTime: expirationTime,
  };
  await this.save();

  return cryptoToken;
};
// TTL index to automatically delete documents after expirationTime
userModel.index(
  { "passwordResetToken.expirationTime": 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("User", userModel);
