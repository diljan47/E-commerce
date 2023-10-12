const jwt = require("jsonwebtoken");

const accessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: "1D" });
};

module.exports = { accessToken };
