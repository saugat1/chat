var mongoose = require("mongoose");
var configOptions = require("../config/config.js");

//Set up default mongoose connection
var mongoDB = configOptions.databases.default.url.toString();
var db = mongoose
  .connect(mongoDB, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(function () {
    console.log("connected");
  }) 
  .catch(function (err) {
    if (err) console.error(err);
  });
 
module.exports = db;
