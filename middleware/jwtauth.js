const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization?.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = decoded;
        next();
      }
    } catch (error) {
      return res.status(400).json("Invalid token or expired token");
    }
  } else {
    return res.status(400).json("No token present");
  }
};

module.exports = jwtAuth;
