var express = require("express");
// const { CSRFValidator } = require("csrf-validator");
var app = express();
let fs = require("fs");
let path = require("path"); 
var session = require("express-session");
var csurf = require("csurf");
let fileUpload = require('express-fileupload')

var cookieParser = require("cookie-parser");
var http = require("http");
require("dotenv").config();
// app.set(express.static("public"));
let hbsHelpers = require("./helpers/hbshelper.js");
var ejs = require("ejs");
// set the view engine to ejs
app.set("view engine", "ejs");
var hbs = require("hbs");
// app.set("view engine", "hbs");
// hbs.registerPartials(__dirname + "/views/partials/");

var config = require("./config/config.js");

var port = process.env.PORT || 8000;

// Public Self-Signed Certificates for HTTPS connection
var privateKey = fs.readFileSync(__dirname + "/cert/key.pem", "utf8");
var certificate = fs.readFileSync(__dirname + "/cert/cert.pem", "utf8");
 
var credentials = { key: privateKey, cert: certificate };
let server = http.createServer(app);
const io = require("socket.io")(server);
let socketHelper = require("./helpers/socketHelpers.js");
let expressSessionMiddleware = require("./middlewares/session.js");

//global middleware
app.all("/*", [require("./middlewares/global.js")]);

// load the cookie-parsing middleware
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "TEST XS",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 60 * 60 * 1000 * 4, //max 4 hours
      httpOnly: true, //only make readable by servers not client side js
      //secure: true, //make cookie secure ?
    },
  })
);

app.use(expressSessionMiddleware);

app.use(
  csurf({
    ignoreMethods: ["GET"],
  })
); //config csrf middleware .


app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 },
}));

// error handler FOR INVALID CSRF
app.use(function (err, req, res, next) {
  if (err.code !== "EBADCSRFTOKEN") return next(err);

  // handle CSRF token errors here
  res.status(403);
  if (req.accepts("json")) {
    res.json({
      //return json err
      message: "403 page expired.",
    });
  } else {
    res.send("403 PAGE EXPIRED."); //request html
  }
});
//use private folder middleware to access images for single conversation
 
//web routes
app.use(require("./routes/web.js"));
 
//api routes
app.use("/api/v1", require("./routes/api.js"));

require("./database/connection.js");
  
//static
app.use(express.static(path.join(__dirname, "public")));
  
//midddleware for socket connection
io.use(require("./middlewares/socketAuth.js"));

io.on("connection", (client) => {
  //update user state active or inactive
  let updateUserState = require("./helpers/auth.js").authState(
    client.userId,
    "active"
  ); 
  const users = [];
  for (let [id, client] of io.of("/").sockets) {
    users.push({
      sId: id,
      userId: client.userId,
    });
  }
  

  client.on("getUsers", function () {
    client.emit("users", users);
  });
  //all events here
  socketHelper(client);
  //all things handeled by this function
});

server.listen(port, function () {
  console.log("running...");
});
