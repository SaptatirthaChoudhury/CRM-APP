const verifySignUp = require("./verifySignup");
const authJwt = require("./auth.jwt");
const verifyUser = require("./checkForValidUser");

/**
 * I can add more middleware here as the project grows
 */
module.exports = {
    verifySignUp,
    authJwt,
    verifyUser
}