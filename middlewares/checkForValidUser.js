
/**
 * This middleware will check the valid user
 */

const User = require("../models/user.model");
const Ticket = require("../models/ticket.model");
const constants = require("../utils/constants");

checkForValidUser = async (req, res, next) => {

    const ticket = await Ticket.findOne({ _id: req.params.id });
    if (!ticket) {
        return res.status(403).send({
            message: "Given ticketId is invalid ! try again"
        })
    }
    const user = await User.findOne({ userId: req.userId })

    if (user.userType == constants.userTypes.customer) {
        if (ticket.reporter == user.userId) {
            next();
        } else {
            return res.status(401).send({
                message: "Only ADMIN | OWNER | ASSIGNED ENGINEER is allowed to update"
            })
        }

    }

    if (user.userType == constants.userTypes.engineer) {
        if (ticket.assignee == user.userId || ticket.reporter == user.userId) {
            next();
        } else {
            return res.status(402).send({
                message: "This ticket neither assigned to you nor created by you"
            })
        }
    }

    next();
}

const verifyUser = {
    checkForValidUser: checkForValidUser
}

module.exports = verifyUser;