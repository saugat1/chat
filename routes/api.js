const router = require("express").Router();
const userAuthMiddleware = require("../middlewares/userauth.js");
const { apiLimiter } = require("../middlewares/apiRateLimitter.js");
const testController = require("../controllers/testController.js");

//import any web controllers here just eg.
let userController = require("../controllers/userController.js");

//register all the web routes here for free.

// Login page route.
router.post("/login", apiLimiter, userController.login);

router.post("/all", testController.userAllMessages);

// Register page route.
router.post("/register", apiLimiter, userController.register);

// Register page route.
router.post(
  "/send_password_reset_link",
  apiLimiter,
  userController.sendPasswordResetLink
);

//logged in user details
router.get("/user", userAuthMiddleware, userController.user);

module.exports = router;
