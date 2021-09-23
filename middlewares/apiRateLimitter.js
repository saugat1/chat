const limiter = require("express-rate-limit");

const apiLimiter = limiter({
  windowMs: 1000 * 60 * 1,
  max: 10,
  message: "Too many requests attempts. try again after 1 minutes.",
  handler: function (req, res) {},
  onLimitReached: function (req, res, options) {
    res.status(options.statusCode).json({
      error: true,
      message: options.message,
    });
  },
});

module.exports = {
  apiLimiter,
};
