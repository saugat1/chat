const router = require("express").Router();
let testController = require("../controllers/testController.js");
let checkLoggedIn = require('../middlewares/redirectIfAuthenicated.js')

//import any web controllers here just eg.
let userController = require("../controllers/userController.js");

//message controller 
let messageController = require("../controllers/messageController.js")

//middleware for user auth
let middleware = require("../middlewares/userauth.js");
let resourceMiddleware = require("../middlewares/resourceMiddleware.js");



//usermdoel
let userModel = require("../models/user.js");

//register all the web routes here for free.

// Home page route.
router.get("/",checkLoggedIn, function (req, res) {
  res.render("index", {
    csrfToken: req.csrfToken(),
  });
});

router.post("/sendmessage",  testController.send);
router.post("/fetchmessage", async function (req, res) {
  let messages = await testController.fetchMessage(req.body);
  return res.json({
    messages,
  });
});

router.get("/user/verify_account", userController.verifyEmail);

router.get("/user/password_reset", userController.setNewPassword);
router.post("/user/updatepassword", userController.updatePassword);

//router for forget password view
router.get("/forgetpassword", checkLoggedIn, function (req, res) {
  return res.render("forget_password", {
    csrfToken: req.csrfToken(),
  });
});

//router for register  view
router.get("/register", checkLoggedIn, function (req, res) {
  return res.render("register", {
    csrfToken: req.csrfToken(),
  });
});

// About page route.
router.get("/home", middleware, testController.test);

router.get("/profile", middleware, userController.profile);
router.post("/updateprofile", middleware, userController.updateprofile);

router.get("/search", middleware, async function (req, res) {
  let user = await userModel.findById(req.userId);
  res.render("search", {
    user: user,
    csrfToken: req.csrfToken(),
  });
});

router.post("/search", middleware, testController.search);

router.post("/userinfo", middleware, userController.userinfo);

router.post('/uploadMessageImage', messageController.uploadMessageImage);

router.get("/logout", userController.logout);

//private routes
router.get(
  "/messages/*",
  [middleware, resourceMiddleware],
  function (req, res, next) {
    next(); //request validated by resourcemiddleware
  }
);

module.exports = router;
