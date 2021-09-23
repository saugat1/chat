let Mail = require("./common.js");

class registrationMail extends Mail {
  constructor(data = null) {
    console.log(data);
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
    console.log("sendmail", this.data);
    return this.to(this.data.email)
      .subject("Email Verification")
      .view("accountVerification")
      .send();
  }
}

module.exports = registrationMail;
