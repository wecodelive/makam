const extractUserFromJwt = require("./extractUserFromJwt.jsx");

const requireAuth = (req, res, next) => {
  const decoded = extractUserFromJwt(req);

  if (!decoded || !decoded.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - invalid or missing token",
    });
  }

  req.user = decoded;
  return next();
};

const requireAdmin = (req, res, next) => {
  const decoded = extractUserFromJwt(req);

  if (!decoded || !decoded.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - invalid or missing token",
    });
  }

  if (!["ADMIN", "SUPER_ADMIN"].includes(decoded.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden - admin access required",
    });
  }

  req.user = decoded;
  return next();
};

module.exports = {
  requireAuth,
  requireAdmin,
};
