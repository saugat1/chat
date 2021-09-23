//Require Mongoose
var mongoose = require("mongoose");

//Define a schema for user
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: { type: String, required: true },
  email: {
    required: true,
    type: String,
    unique: true,
  },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now() },
  email_verified_at: { type: Date },
  active: {
    type: Boolean,
    default: false,
  },
  picture: {
    type: String,
    default: "some image url",
  },
  token: {
    type: String,
  },
  last_active: {
    type: String,
    default: null,
  },
  online: {
    type: Boolean,
    default: false,
  },
  token_created_at: {
    type: Date,
    default: Date.now(),
  },
  peerId: {
    type: String,
  },
  about: {
    type : String,
    default : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis at laborum, dignissimos repellendus ex beatae, pariatur hic incidunt numquam officia debitis assumenda eius vitae tempore.'
  }
});

module.exports = mongoose.model("user", userSchema);
