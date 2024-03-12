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
      } else {
        return res.status(401).json("No token found");
      }
    } catch (error) {
      return res.status(401).json("Invalid token or expired token");
    }
  }
};

module.exports = jwtAuth;
