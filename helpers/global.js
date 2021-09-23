var { addMinutes, isPast, parseISO, addSeconds, parse } = require("date-fns");
var configOption = require("../config/config.js");

/**
 *
 * @param {tokenIssuedDate} oldDate
 * @returns bool
 * returns true if not expired else return false;
 */

function checkIfTokenExpires(oldDate) {
  let toTimestamp = (strDate) => Date.parse(strDate);
  let dateDiff = (new Date().getTime() - toTimestamp(oldDate)) / (1000 * 60);
  let expireMinutes = configOption.token_expiry_time;

  return dateDiff > expireMinutes ? true : false; //true or false ;
}

module.exports = {
  checkIfTokenExpires,
};
