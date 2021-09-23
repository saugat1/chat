let Mail = require("./common.js");

class forgetPasswordEmail extends Mail {
  constructor(data = null) {
    super(data);
    this.data = data;
  }

  /**
   *
   * @returns bool
   * true on success false on failure
   *
   */
  sendMail() {
    return this.to(this.data.email)
      .subject("Password Reset Request")
      .view("passwordReset")
      .send();
  }
}

module.exports = forgetPasswordEmail;
