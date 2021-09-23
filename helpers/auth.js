const userModel = require("../models/user.js");
exports.authState = async function (userid, type) {
  if (type && userid) {
    if (type == "active") {
      let updatedState = await userModel.findByIdAndUpdate(userid, {
        last_active: new Date().getTime(),
        online: true,
      });
      return updatedState ? true : false;
    } else {
      let updatedState = await userModel.findByIdAndUpdate(userid, {
        last_active: new Date().getTime(),
        online: false,
      });
      return updatedState ? true : false;
    }
  }
};
