const jwt = require("jsonwebtoken");

const createrefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: "1D" });
};

module.exports = { createrefreshToken };
