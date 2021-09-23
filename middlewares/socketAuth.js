const jwtHelper = require("../helpers/jwt.js");
const isUserValid = async function (socket, next) {
  try {
    let token = socket.handshake.auth?.token;
    if (!token) {
      next(new Error("Unauthorized."));
    }
    //verify jwt
    let isValidJwt = await jwtHelper.verifyToken(
      token.replace("Bearer ", ""),
      "data"
    );

    if (!isValidJwt.id) {
      next(new Error("Unauthorized"));
    } else {
      socket.userId = isValidJwt.id;
      next();
    }
  } catch (error) {
    next(new Error("Error."));
  }
};

module.exports = isUserValid;
