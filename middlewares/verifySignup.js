/**
 * This file will have the logic to validate the incoming request body
 */

const User = require("../models/user.model");
const constants = require("../utils/constants");

const emailValidator = require('deep-email-validator');



validateSignupRequestBody = async (req, res, next) => {

    // Validate if name is present
    if (!req.body.name) {
        return res.status(400).send({
            message: "Failed ! User name is not provided"
        })

    }

    // Validate if the userId is present and it's not duplicate
    if (!req.body.userId) {
        return res.status(400).send({
            message: "Failed ! UserId is not provided"
        })
    }
    try {
        const user = await User.findOne({ userId: req.body.userId });
        if (user != null) {
            return res.status(400).send({
                message: "failed ! UserId is already taken"
            })
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            message: "Internal server error while validating the request"
        })
    }

    // Validate if the password is present or not
    /**
     * Logic to do extra validations : 
     * 1. It should be of minimum length 10
     * 2. Alphabets, numerics and special character atleast one
     */

    if (!req.body.password) {
        return res.status(400).send({
            message: "Failed ! Password is not provided"
        })
    }

    // Validate if the email is present, is valid and not duplicate
    if (!req.body.email) {
        return res.status(400).send({
            message: "Failed ! Email is not provided"
        })
    }

    if (!isValidEmail(req.body.email)) {
        return res.status(400).send({
            message: "Failed ! Not a valid email id"
        })
    }
    // Validate if the userType is present and valid
    if (!req.body.userType) {
        return res.status(400).send({
            message: "Failed ! User type is not passed"
        })
    }

    if (req.body.userType == constants.userTypes.admin) {
        return res.status(400).send({
            message: "ADMIN registration is not allowed"
        })

    }

    const userTypes = [constants.userTypes.customer, constants.userTypes.engineer];

    if (!userTypes.includes(req.body.userType)) {
        return res.status(400).send({
            message: "Provided userType is not correct. Possible correct values : CUSTOMER | ENGINEER"
        })

    }

    async function isValidEmail(email) {
        return await emailValidator.validate(email)
    }


    next() // Give control to the next middleware or controller
}


validateSignInRequestBody = (req, res, next) => {

    if (!req.body.userId) {
        return res.status(400).send({
            message: "Failed ! UserId is not provided"
        })
    }

    if (!req.body.password) {
        return res.status(400).send({
            message: "Failed ! Password is not provided"
        })
    }


    next();
}


const verifyRequestBodiesForAuth = {
    validateSignupRequestBody: validateSignupRequestBody,

    validateSignInRequestBody: validateSignInRequestBody
}

module.exports = verifyRequestBodiesForAuth