const jwt = require("jsonwebtoken");

const accessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: "5min" });
};

module.exports = { accessToken };
