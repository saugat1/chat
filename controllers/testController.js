let userModel = require("../models/user.js");

let messageModel = require("../models/message.js");
let escapeHtml = require("escape-html");

exports.test = async function (req, res) {
  try {
    let userId = req.userId;
    let token = req.session.token;
    let r = req.query.r;
    let t = req.query.t;
    let im_open = false;
    if (t && r) {
      var now = new Date().getTime();
      var rec = await userModel.findById(r);
      if (rec.name && now - t < 30000) {
        im_open = true;
      } else {
        im_open = false;
      }
    }

    if (!userId) {
      return res.json({
        success: false,
        message: "user id not valid.",
      });
    }

    let uniqueConversations = await messageModel
      .find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
      .sort({ send_time: -1 })
      .distinct("conversationId"); //array
    let uniqueLastUserMessages = {};
    let temp = [];
    let unreadCount = [];
    uniqueConversations.forEach((item) => {
      if (Object.hasOwnProperty.call(uniqueLastUserMessages, item)) {
      } else {
        messageModel
          .find({ conversationId: item })
          .populate([
            {
              path: "receiver",
              select: "name email online last_active picture",
            },
            {
              path: "sender",
              select: "name email online last_active picture",
            },
          ])
          .then((data) => {
            // unreadCount count to f
            temp.push(data[data.length - 1]);
            let unreadCountPerConversation = data.filter(
              (ite) => ite.seen == false && ite.sender._id != userId
            ).length;
            unreadCount.push(item + "-" + unreadCountPerConversation); //count unread message length by receiver .
          });
      }
    });

    let user = await userModel.findById(userId, {
      password: 0,
      token: 0,
      token_created_at: 0,
    });

    setTimeout(() => {
      return res.render("home", {
        m: temp,
        user,
        userId,
        token,
        im_open,
        unreadCount,
        csrfToken: req.csrfToken(),
      });
      res.end();
    }, 2000);
  } catch (e) {
    res.json({
      err: e.message,
    });
  }
};

exports.seenUnseenMessage = async function (data) {
  conversationId = data.conversationId;
  let done = await messageModel.updateMany(
    { conversationId, receiver: data.userId, seen: false },
    {
      seen: true,
    }
  );
  return done ? true : false;
};

exports.send = async function (data) {
  try {
    let d = data;
    let receiver = d.receiver;
    let sender = d.sender;
    let message = escapeHtml(d.message); //escapes an html
    let attachmentURL = d.attachment;
    let conid = [sender, receiver].sort().join("_"); //unique for each two users //

    let msg = new messageModel({
      receiver,
      sender,
      message,
      attachment: attachmentURL,
      conversationId: conid,
    });

    sent = await msg.save();
    return sent ? true : false;
  } catch (err) {
    return false;
  }
};

exports.userAllMessages = async function (req, res) {
  try {
    let userId = req.body.userid;

    if (!userId) {
      return res.json({
        success: false,
        message: "user id not valid.",
      });
    }

    let uniqueConversations = await messageModel
      .find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
      .sort({ send_time: -1 })
      .distinct("conversationId"); //array
    let uniqueLastUserMessages = {};
    let temp = [];
    uniqueConversations.forEach((item) => {
      if (Object.hasOwnProperty.call(uniqueLastUserMessages, item)) {
      } else {
        messageModel
          .findOne({ conversationId: item })
          .populate([
            {
              path: "receiver",
              select: "name email picture online last_active",
            },
            {
              path: "sender",
              select: "name email picture online last_active",
            },
          ])
          .then((data) => {
            temp.push(data[data.length - 1]);
          });
      }
    });
    let users = await userModel.find();

    setTimeout(() => {
      return res.render("test", { m: temp, user, userId });
    }, 1500);

    res.end();
  } catch (e) {
    res.json({
      err: e.message,
    });
  }
};

exports.fetchMessage = async function (data) {
  let receiver = data.receiver;
  let sender = data.sender;
  console.log(receiver);
  // $or: [{ name: "Rambo" }, { breed: "Pugg" }, { age: 2 }]
  let messages = await messageModel
    .find({
      $or: [
        { receiver, sender },
        { receiver: sender, sender: receiver },
      ],
    })
    .populate([
      {
        path: "receiver",
        select: "email name",
      },
      {
        path: "sender",
        select: "email name",
      },
    ]);

  return messages;
};

exports.search = async function (req, res) {
  let query = req.body.query;
  if (!query) {
    return res.json({ success: false });
  }
  try {
    let users = await userModel.find(
      {
        $or: [
          { name: new RegExp(query, "i") },
          { email: new RegExp(query, "i") },
        ],
      },
      { name: 1, email: 1, picture: 1 }
    );

    let filterUser = users.filter((item) => item._id != req.userId);

    return res.json({
      success: true,
      data: filterUser,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

exports.test1 = async function (req, res) {
  // let messages = await messageModel
  //   .find()
  //   .sort({ send_time: -1 })
  //   .distinct("conversationId")
  //   .populate([
  //     {
  //       path: "receiver",
  //       select: "name email",
  //     },
  //     {
  //       path: "sender",
  //       select: "name email",
  //     },
  //   ]);
  // { "abc": { $regex: '.*' + colName + '.*' } }
  let userId = "6139718a02725906d624ebbf";
  let uniqueConversations = await messageModel
    .find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
    .sort({ send_time: -1 })
    .distinct("conversationId"); //array
  let uniqueLastUserMessages = {};
  let temp = [];
  uniqueConversations.forEach((item) => {
    if (Object.hasOwnProperty.call(uniqueLastUserMessages, item)) {
    } else {
      messageModel
        .findOne({ conversationId: item })
        .populate([
          {
            path: "receiver",
            select: "name email",
          },
          {
            path: "sender",
            select: "name email",
          },
        ])
        .then((data) => {
          temp.push(data);
        });
    }
  });
  setTimeout(() => {
    return res.json({ data: temp });
  }, 1500);
};
