const jwt = require("jsonwebtoken");

const createrefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: "2D" });
};

module.exports = { createrefreshToken };
