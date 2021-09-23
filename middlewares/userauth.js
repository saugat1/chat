const jwtHelper = require("../helpers/jwt.js");
const middleware = async function (req, res, next) {
  try {
    let headers = req.headers;
    let session = req.session;

    //verify jwt
    // let ip = headers["x-forwarded-for"] || req.connection.remoteAddress;
    if (!session.token && !headers.authorization) {
      // return res.json({
      //   code: 403,
      //   message: "Token not provieded.",
      // });
      return res.redirect('/')
    }
    let token = headers.authorization || session.token;

    isValidJwt = await jwtHelper.verifyToken(
      token.replace("Bearer ", ""),
      "data"
    );

    if (!isValidJwt.id) {
      // return res.json({
      //   code: 403,
      //   message: "Unauthorized or invalid token",
      // });
      return res.redirect('/')
    }
    req.userId = isValidJwt.id;
    next();
  } catch (error) {
    res.json({
      message: error,
      code: 500,
    });
  }
};

module.exports = middleware;
