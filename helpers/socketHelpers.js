let testController = require("../controllers/testController.js");
let fs = require("fs");
let base64_decode = require("locutus/php/url/base64_decode");

function socketHelper(client) {
  client.on("event", (data) => {
    console.log(data);
  });

  //mark current user inactive when they disconnects.
  client.on("disconnect", () => {
    require("./auth.js").authState(client.userId, "inactive");
  });

  //emited send message fro client save into db and push new messages to client if verified.
  client.on("sendmessage", async function (data) {
    let send = await testController.send(data);
    if (send) {
      let messages = await testController.fetchMessage({
        sender: data.sender,
        receiver: data.receiver,
      });
      client.emit("message", messages);
      client.broadcast.emit("message", messages);
    }
  });
  //set mark as read message for specific conversation id
  client.on("markAsRead", async function (data) {
    if (data.conversationId && data.userId == client.userId) {
      let done = await testController.seenUnseenMessage({
        ...data,
      });
      if (done) {
        //emit seen success event
        client.emit("messageSeenSuccessfully", data.conversationId);
      }
    }
  });

  //image upload features
  client.on("sendImage", async function (data) {
    let { imageData, _csrf, userId, receiver } = data;
    let pure = imageData.split(",")[1];
    if (userId != client.userId) return; //sender is not genuine
    var conid = [userId, receiver].sort().join("_");
    if (!fs.existsSync("public/messages/" + conid)) {
      fs.mkdirSync("public/messages/" + conid); //make dir if not exists
    }

    //write file to that dierctory

    //verify csrf
    var fname =
      conid + new Date().getTime() + Math.random().toString(16) + ".png";
    fs.writeFile(
      "public/messages/" + conid + "/" + fname,
      pure,
      "base64",
      function (err) {
        console.log(err);
      }
    );
    var data = {
      sender: userId,
      receiver,
      message: "Attachment",
      attachment: "messages/" + conid + "/" + fname,
    };
    let send = await testController.send(data);
    if (send) {
      let messages = await testController.fetchMessage({
        sender: data.sender,
        receiver: data.receiver,
      });
      client.emit("message", messages);
      client.broadcast.emit("message", messages);
    }
  });
}

module.exports = socketHelper;
