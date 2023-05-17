
/**
 * This middleware will check the valid user
 */

const User = require("../models/user.model");
const Ticket = require("../models/ticket.model");
const constants = require("../utils/constants");

checkForValidUserForTicket = async (req, res, next) => {

    const ticket = await Ticket.findOne({ _id: req.params.id });
    // console.log(ticket);
    if (!ticket) {
        return res.status(403).send({
            message: "Given ticket Id is invalid ! try again"
        })
    }
    const user = await User.findOne({ userId: req.userId })

    if (user.userType == constants.userTypes.customer) {
        if (ticket.reporter != user.userId) {
            return res.status(401).send({
                message: "Only ADMIN | OWNER | ASSIGNED ENGINEER is allowed to update"
            })
        }

    }

    if (user.userType == constants.userTypes.engineer) {
        if (ticket.assignee != user.userId && ticket.reporter != user.userId) {
            return res.status(402).send({
                message: "This ticket neither assigned to you nor created by you"
            })
        }
    }

    /**
     * If the update requires the change in the assignee
     * 
     * 1. Only ADMIN should be allowed to do this change
     * 2. Assignee should be a valid Engineer
     */

    if (req.body.assignee != ticket.assignee) {
        if (user.userType == constants.userTypes.customer || user.userType == constants.userTypes.engineer) {
            return res.status(403).send({
                message: "Only ADMIN is allowed to re-assign a ticket"
            })
        }

    }

    if (req.body.assignee) {
        const engineer = await User.findOne({ userId: req.body.assignee });
        if (engineer == null) {
            return res.status(401).send({
                message: "Engineer userId passed as assignee is wrong"
            })
        }
    }

    next();
}

const verifyUserForTicket = {
    checkForValidUserForTicket: checkForValidUserForTicket
}

module.exports = verifyUserForTicket;