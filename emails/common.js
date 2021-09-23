let configurations = require("../config/config.js");
let mailer = require("nodemailer");
let hbs = require("nodemailer-express-handlebars");
let path = require("path");
let process = require("process");
var ejs = require("ejs");

class Mail {
  toEmail = null;
  fromEmail = configurations.smtp.default.fromEmail;
  fromName = configurations.smtp.default.fromName;
  emailSubject = "";
  emailCc = "";
  emailBcc = "";
  reply = this.fromEmail;
  viewPath = "";
  data = null;

  /**
   *
   * @param {data} data to pass to the email template view
   * @object || @array
   */
  constructor(data = null) {
    console.log(data);
    // this.data = data;
  }

  /**
   *
   * @param {receiver email} email required
   * @return this
   */

  to(email) {
    this.toEmail = email;
    return this;
  }

  /**
   *
   * @param {email from} email optional
   * @returns this
   */
  from(email) {
    this.fromEmail = email;

    return this;
  }

  /**
   *
   * @param {subject of email} subject optional
   * @returns this
   */
  subject(subject) {
    this.emailSubject = subject;
    return this;
  }

  /**
   *
   * @param {carbon copy} cc optional
   * return this
   */
  cc(cc) {
    this.emailCc = cc;
    return this;
  }

  /**
   *
   * @param {blind carbon copy} bcc optional
   * @returns
   */

  bcc(bcc) {
    this.emailBcc = bcc;
    return this;
  }

  /**
   *
   * @param {reply to email address } email optional
   * @returns this
   */
  replyTo(email) {
    this.reply = email;
    return this;
  }

  /**
   *
   * @param {view} viewname || path for email template
   * path is relative to /views so file name inside views directory eg. verification.hbs
   * or use folder/somefile.hbs...
   * @returns this
   */

  view(viewname) {
    this.viewPath = viewname;
    return this;
  }

  createTransport() {
    let transporter = mailer.createTransport({
      host: configurations.smtp.default.host,
      port: configurations.smtp.default.port,
      secure: true, //for port 465
      auth: {
        user: configurations.smtp.default.username,
        pass: configurations.smtp.default.password,
      },
    });
    return transporter;
  }

  /**
   *
   * @returns bool
   * if the mail is sent successfully returns true else false on failure
   */
  async send() {
    try {
      //send action goes here ...
      let transporter = this.createTransport();

      // transporter.use(   //for hbs templates
      //   "compile",
      //   hbs({
      //     viewEngine: {
      //       extname: ".hbs",
      //       defaultLayout: "",
      //       layoutsDir: "views/",
      //     },
      //     viewPath: "views/emails",
      //     extName: ".hbs",
      //   })
      // );

      let template = await ejs.renderFile(
        process.cwd() + "/views/emails/" + this.viewPath + ".ejs",
        this.data
      );

      let mailInfo = await transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: this.toEmail,
        cc: this.emailCc,
        bcc: this.emailBcc,
        subject: this.emailSubject,
        html: template,
        replyTo: this.reply,
      });
      if (mailInfo.messageId) {
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}

module.exports = Mail;
