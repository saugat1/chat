let mongoose = require("mongoose");

let messageSchema = new mongoose.Schema({
  receiver: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  sender: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  message: {
    type: String,
    default: null,
  },
  send_time: {
    type: Date,
    default: Date.now(),
  },

  attachment: {
    type: String,
    default: null,
  },
  conversationId: {
    type: String,
    default: null,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("messages", messageSchema);
