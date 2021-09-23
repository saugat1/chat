function resourceMiddleware(req, res, next) {
  let userId = req.userId; //get user id //
  let url = req.url;
  let valid = url.search(userId);
  if (valid != -1) {
    next();
  } else {
    res.status(430).end("403 Forbidden.");
  }
}

module.exports = resourceMiddleware;
