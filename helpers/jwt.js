const jwt = require("jsonwebtoken");
const configOptions = require("../config/config.js");

/**
 *
 * @param {email,name,any} data
 * @return String [token] or false on failure
 */
exports.createToken = async function (data) {
  var secret = configOptions.credintals.jwt_secret_key;
  try {
    var token = await jwt.sign(data, secret, { expiresIn: "4h" });
    return token;
  } catch (error) {
    return false;
  }
};

/**
 *
 * @param {jwt token} token
 * @param {type} type to return jwt data or boolean
 * @return bool || object
 */
exports.verifyToken = async function (token, type = null) {
  var secret = configOptions.credintals.jwt_secret_key;
  try {
    let data = await jwt.verify(token, secret, {});

    return data ? (type == "bool" ? true : data) : false;
  } catch (error) {
    return false;
  }
};
