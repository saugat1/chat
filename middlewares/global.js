var configOptions = require("../config/config.js");

var globMiddleware = function (req, res, next) {
  if (configOptions.app_maintinance_mode == "true") {
    return res.render('under_construction');
  }
 
  let base_url = req.protocol + "://" + req.headers.host;
  req.base_url = base_url;

  next(); // pass control to the next handler
};

module.exports = globMiddleware;
