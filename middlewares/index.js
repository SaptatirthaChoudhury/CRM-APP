const verifySignUp = require("./verifySignup");
const authJwt = require("./auth.jwt");
const verifyUserForTicket = require("./checkForValidUser");

/**
 * I can add more middleware here as the project grows
 */
module.exports = {
    verifySignUp,
    authJwt,
    verifyUserForTicket
}