const jwt = require("jsonwebtoken");

const extractUserFromJwt = (req) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = extractUserFromJwt;
