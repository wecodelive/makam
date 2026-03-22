const getJwtToken = require("../helpers/getJwtToken.jsx");

const setTokenCookie = (res, user) => {
  const token = getJwtToken(user);
  const isProduction = process.env.NODE_ENV === "production";
  const sameSitePolicy =
    process.env.COOKIE_SAMESITE || (isProduction ? "none" : "lax");
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: sameSitePolicy,
    secure: sameSitePolicy === "none" ? true : isProduction,
  };
  user.password = undefined;

  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = setTokenCookie;
