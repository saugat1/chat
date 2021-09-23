let userModel = require("../models/user.js");
let jwtHelper = require("../helpers/jwt.js");
let bcrypt = require("bcryptjs");
var configOptions = require("../config/config.js");
let registrationMail = require("../emails/registratonEmail.js");
let pResetMail = require("../emails/forgetpasswordEmail.js");
let validator = require("validator");
let { checkIfTokenExpires } = require("../helpers/global.js");

exports.index = function (req, res) {
  res.send("resposne from user controller");
};

exports.login = async function (req, res) {
  try {
    var email = req.body.email;
    var password = req.body.password;
    if (email && password) {
      let userExists = await userModel.find({
        email,
        active: true,
      });

      if (userExists.length == 1 && userExists[0].email) {
        if (bcrypt.compareSync(password, userExists[0].password)) {
          //generate jwt
          let jwtToken = await jwtHelper.createToken({
            id: userExists[0].id,
            email: userExists[0].email,
          });

          switch (
            req.accepts(["html", "json"]) //possible response types, in order of preference
          ) {
            case "html":
              // respond with HTML
              req.session.token = jwtToken; //express session for web token
              res.redirect("/home");
              res.end();
              break;
            case "json":
              req.session.token = jwtToken;
              // respond with JSON
              res.json({
                success: true,
                message: "user login success.",
                data: {
                  name: userExists[0].name,
                  email: userExists[0].email,
                  token: jwtToken,
                },
              });
              break;
            default:
              res.status(400).send("Bad Request");
              return;
          }
        } else {
          return res.json({
            success: false,
            message: "invalid email or password",
          });
          res.end();
        }
      } else {
        return res.json({
          success: false,
          message: "invalid email or password.",
        });
        res.end();
      }
    } else {
      return res.json({
        success: false,
        message: "Please enter Email and Password!",
      });
      res.end();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    res.end();
  }
};

function response(res, field, msg) {
  return res.json({
    success: false,
    code: 400,
    message: msg ? msg : `${field} field is required.`,
    timestamp: new Date().getTime(),
  });
}

exports.register = async function (req, res) {
  try {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let confirm_password = req.body.confirm_password;

    if (name == null || name == "" || name.length < 3) {
      return response(res, "name");
      return res.end();
    } else if (password == null || password == "" || password.length < 3) {
      return response(res, "password");
      return res.end();
    } else if (password !== confirm_password) {
      return response(res, "", "confirm password is not matching.");
      return res.end();
    } else if (!validator.default.isEmail(email)) {
      return response(res, "", "please enter a valid email address");
      return res.end();
    }

    //hash password
    var salt = bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password, salt);
    let token = bcrypt.hashSync(new Date().getTime() + "saugatmgr", salt);

    //send mail
    let link = req.base_url + "/user/verify_account?key=" + token;

    let user = await userModel.create({
      name,
      email,
      password,
      token,
      picture: req.base_url + "/user/default.png",
    }); //when mail sent create new user
    var d = { email: email, name: name, link: link };
    console.log(d);
    let insTance = new registrationMail(d);

    let sent = await insTance.sendMail();
    console.log(sent);
    if (sent) {
      return res.json({
        success: true,
        code: 201,
        message:
          "new user registered successfully. please verify your email address.",
        data: {
          name: user.name,
          email: user.email,
        },
      });
    } else {
      await userModel.findByIdAndDelete(user.id); //delete if mail sent failed
      return res.json({
        message: "failed to register new user at this time.",
        success: false,
        code: 405,
      });
    }
    res.end();
  } catch (err) {

    if(err.code && err.code == 11000) return res.json({
      success:false, message : 'email alreay taken.'
    });

    
    return res.status(400).json({
      success: false,
      message: err.message,
    });
    res.end();
  }
};

exports.profile = async function(req,res){
  let id = req.userId;
  let user = await userModel.findById(id, {
    password: false,
    token: false,
  });

  u = user;
  res.render('profile',{
    data: u,
    csrfToken : req.csrfToken()
  });
  
}

exports.updateprofile = async function(req,res){
  let body = req.body;
  let name = body.name;
  let about = body.about;
  let picture = req.files?.picture;
  console.log(picture)
  if(name && about){
  try {

   let data = {name,about}


if(picture && picture.name){
  
  let validFiles = ['jpg', 'jpeg', 'png'];
  let fileExtension = picture.name.split('.');
  ext = fileExtension[fileExtension.length - 1];

  if(!validFiles.includes(ext)){
    return res.status(500).json({success:false, message: 'upload a valid file.'});
  } 
  var fname = req.userId+picture.name;
  await picture.mv(process.cwd()+'/public/user/'+fname, function(err){
    if (err)
    return res.status(500).json({success:false, message: err.message});
    
  data.picture =  req.base_url + '/user/'+ fname;
  let updated =  userModel.findByIdAndUpdate(req.userId, data).then(()=>{
    return res.status(200).json({success:true, message: 'updated success.'});
  }).catch(err=>{
    return  res.status(500).json({success:false, message: 'failed to update.'});
  });


  })
  
}else{
  let updated = await userModel.findByIdAndUpdate(req.userId, data);
  if(updated){
    return res.status(200).json({success:true, message: 'updated success.'});
  }
  else{
   return  res.status(500).json({success:false, message: 'failed to update.'});
  }
}

  


    
  } catch (error) {
    return  res.json({
      success:false,
      message : error.message
    })
  }
  }else{
    return res.json({
      success:false,
      message : 'server errors'
    })
  }
}

exports.user = async function (req, res) {
  let id = req.userId;
  let user = await userModel.findById(id, {
    password: false,
    token: false,
  });

  u = user;
  user.token_created_at = null;
  res.json({
    data: u,
  });
  res.end();
};

exports.forget_password = function (req, res) {};

exports.sendPasswordResetLink = async function (req, res) {
  try {
    let email = req.body.email;
    if (validator.default.isEmail(email)) {
      //find email in db
      let emailExists = await userModel.find({
        email,
        active: true,
      });
      if (emailExists.length == 1) {
        //email exists send verification link
        var salt = bcrypt.genSaltSync();
        let token = bcrypt.hashSync(new Date().getTime() + "saugatmgr", salt);
        let link = req.base_url + "/user/password_reset?key=" + token;
        await userModel.findOneAndUpdate(
          { email },
          {
            token: token,
            token_created_at: new Date().toISOString(),
          }
        );
        let mailInstanse = new pResetMail({ email, link });
        let send = await mailInstanse.sendMail();

        if (send) {
          return res.status(200).json({
            success: true,
            message:
              "Password Reset Link sent successfully. check your mailbox to create new password.",
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "Failed to send Email.",
          });
        }
        res.end();
      } else {
        //email not exists
        return res.status(400).json({
          success: false,
          message: "Email not exists. or email is not verified",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Email Address not valid.",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};

exports.verifyEmail = async function (req, res) {
  if (!req.query.key) {
    return res.status(404).json({
      code: 400,
      message: "Invalid Path/ file not found.",
    });
  }

  let key = req.query.key;
  //find user related to this token in db
  let found = await userModel.find({
    token: key,
    active: false,
  });

  if (found.length == 1) {
    //token exists now ???

    if (checkIfTokenExpires(`${found[0].token_created_at}`)) {
      //expired true
      return res.render("verifyEmail", {
        valid: false,
        message: "Token Expired. please try again",
        token: key,
      });
    } else {
      //expired false not expired
      //update user details to verified ans show success
      var salt = bcrypt.genSaltSync();
      let token = bcrypt.hashSync(new Date().getTime() + "saugatmgr", salt);
      await userModel.findByIdAndUpdate(found[0].id, {
        active: true,
        email_verified_at: new Date().toLocaleDateString("en"),
        token,
      });

      return res.render("verifyEmail", {
        valid: true,
        token: key,
        user_id: found[0].id,
      });
    }
  } else {
    //token not exists
    return res.render("verifyEmail", {
      valid: false,
      token: key,
      message: "404",
    });
  }
};

exports.setNewPassword = async function (req, res) {
  try {
    if (!req.query.key) {
      return res.status(404).json({
        code: 400,
        message: "Invalid Path/ file not found.",
      });
    }

    let key = req.query.key;
    //find user related to this token in db
    let found = await userModel.find({
      token: key,
      active: true,
    });

    if (found.length == 1) {
      //token exists now ???

      if (checkIfTokenExpires(`${found[0].token_created_at}`)) {
        //expired true

        return res.render("setNewPassword", {
          valid: false,
          message: "Token Expired. please try again",
          token: key,
        });
      } else {
        //expired false not expired
        var salt = bcrypt.genSaltSync();
        let token = bcrypt.hashSync(new Date().getTime() + "saugatmgr", salt);
        return res.render("setNewPassword", {
          valid: true,
          token: key,
          csrfToken: req.csrfToken(),
          user_id: found[0].id,
        });
      }
    } else {
      //token not exists
      return res.render("setNewPassword", {
        valid: false,
        token: key,
        message: "404",
      });
    }
  } catch (error) {
    return res.render("setNewPassword", {
      valid: false,
      token: key,
      message: "404",
    });
  }
};

exports.updatePassword = async function (req, res) {
  try {
    let pass = req.body.password;
    let cpass = req.body.confirm_password;
    let token = req.body.token;
    if (!token) {
      return res.render("messages/error", {
        message: "Unauthorized Request.",
      });
    }
    if (pass.length < 6 || pass !== cpass) {
      return res.render("messages/error", {
        message: "Password are not Matching. or less then 6 chars.",
      });
    }
    //password validated
    var salt = bcrypt.genSaltSync();
    var password = bcrypt.hashSync(pass, salt);
    let updated = await userModel.findOneAndUpdate(
      {
        token,
      },
      {
        password: password,
        token:
          new Date().getTime() + "lsd.xlk3490iffdsf.adda09fdlkfjsdka$#@423lkj",
      }
    );
    if (updated) {
      return res.render("messages/success", {
        message: "Password Changed Successfully. you can now login.",
      });
    } else {
      return res.render("messages/error", {
        message: "Couldnot change password at this time.",
      });
    }
  } catch (error) {
    return res.render("messages/error", {
      message: error.message,
    });
  }
};

exports.userinfo = async function (req, res) {
  let receiver = req.body.receiver;

  if (!receiver) {
    return res.json({
      success: false,
      message: "no id found",
    });
  }
  let user = await userModel.findById(receiver, {
    password: 0,
    token: 0,
    token_created_at: 0,
  });

  if (user.name) {
    return res.json({
      success: true,
      data: user,
    });
  } else {
    return res.json({
      success: false,
    });
  }
};

exports.logout = function (req, res) {
  req.session.destroy();
  res.redirect("/");
};
