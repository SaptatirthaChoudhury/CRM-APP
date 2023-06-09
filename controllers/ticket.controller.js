/**
 * This file should have the logic to create controller for Ticket resource
 */
const User = require("../models/user.model");
const Ticket = require("../models/ticket.model");
const constants = require("../utils/constants");
const sendNotificationReq = require("../utils/notificationClient");

/**
 * Method to create the logic of creating tickets
 * 
 * 1. Any authenticated user should be able to create the ticket
 *                -- Middleware should take care of this 
 * 
 * 2. Ensure that request body has valid data
 *            -- Middleware should take care of this 
 * 
 * 3. After the ticket is created, ensure the customer and Engineer documents
 * 
 * 4. Send the email after the ticket is created to all the stakeholders
 */

exports.createTicket = async (req, res) => {

    /**
     * Read from the request body and create the ticket object
     */
    try {

        const ticketObj = {
            title: req.body.title,
            ticketPriority: req.body.ticketPriority,
            description: req.body.description,
            status: req.body.status,
            reporter: req.userId  // I got it from access token
        }

        /**
         * Find the Engineer available and attach to the ticket Object
         * 
         * Assignment :
         * 
         * Extend this to choose the Engineer which has least number of tickets assigned
         */
        const engineer = await User.findOne({
            userType: constants.userTypes.engineer,
            userStatus: constants.userStatus.approved
        })

        if (engineer) {
            ticketObj.assignee = engineer.userId;
        }

        /**
         * Now create the ticket (ticket object is already created and now creating ticket as an collection)
         *      - Insert that ticket id in customer and engineer document
         */

        const ticketCreated = await Ticket.create(ticketObj);

        if (ticketCreated) {

            // Update the Customer document
            const customer = await User.findOne({
                userId: req.userId
            });

            customer.ticketsCreated.push(ticketCreated._id);
            await customer.save();

            // Update the Engineer document
            if (engineer) {
                engineer.ticketsAssigned.push(ticketCreated._id);
                await engineer.save();
            }

            //Now we should send the notification request to notificationService
            sendNotificationReq(`subject : ${ticketCreated.title}`, `content : ${ticketCreated.description}`, `${customer.email}, ${engineer.email}`, "CRM APP");

            res.status(201).send(ticketCreated);
        }

    } catch (err) {
        console.log("Error while doing the DB operation ", err.message);
        res.status(500).send({
            message: "Internal server error ! "
        })
    }

}

/**
 *  Getting all the tickets
 */

exports.getAllTickets = async (req, res) => {

    /**
     * We need to find the userType
     * and depending on the user type we need to frame the search query
     */
    const user = await User.findOne({ userId: req.userId });
    const queryObj = {};
    const ticketsCreated = user.ticketsCreated; // this is an array of ticket_id
    const ticketsAssigned = user.ticketsAssigned;


    // const ticketInfo = await Ticket.find({ reporter: req.userId });
    // // Create an empty array to store ticket information
    // const ticketsArray = [];
    // const ticketObj = {};

    // // Loop through the original array and add each ticket to the new array
    // for (let i = 0; i < ticketInfo.length; i++) {
    //     // Create a new object for the ticket

    //     // Add the ticket information to the new object
    //     ticketObj._id = ticketInfo[i]._id;
    //     ticketObj.title = ticketInfo[i].title;
    //     ticketObj.description = ticketInfo[i].description;
    //     ticketObj.assignee = ticketInfo[i].assignee;

    //     // Add the new object to the array of tickets
    //     ticketsArray.push(ticketObj);
    // }


    if (user.userType == constants.userTypes.customer) {
        /**
         *  Query for fetching all the tickets created by the user
         * 
         */

        if (!ticketsCreated) {
            return res.status(200).send({
                message: "No tickets created by the user yet"
            });
        }
        queryObj["_id"] = { $in: ticketsCreated };


        console.log(queryObj);


    } else if (user.userType == constants.userTypes.engineer) {
        /**
         * Query object for fetching all the tickets assigned/created to a user
         */
        queryObj["$or"] = [{ "_id": { $in: ticketsCreated } }, { "_id": { $in: ticketsAssigned } }]
        console.log(queryObj);

    }

    const tickets = await Ticket.find(queryObj);

    res.status(200).send(tickets);


}


/**
 * Write the controller function to take care of updates
 */
exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ _id: req.params.id });
        const oldAssigneeEngineer = ticket.assignee;
        /**
         * Update this ticket object based on the request body passed
         */

        ticket.title = req.body.title != undefined ? req.body.title : ticket.title;
        ticket.description = req.body.description != undefined ? req.body.description : ticket.description;
        ticket.ticketPriority = req.body.ticketPriority != undefined ? req.body.ticketPriority : ticket.ticketPriority;
        ticket.status = req.body.status != undefined ? req.body.status : ticket.status;
        ticket.assignee = req.body.assignee != undefined ? req.body.assignee : ticket.assignee;

        const updatedTicket = await ticket.save();
        console.log("updatedTicket : ", updatedTicket);
        /**
         * Let's say admin has handover the ticket to another engineer then assignee engineer document must be updated 
         */
        if (oldAssigneeEngineer != updatedTicket.assignee) {
            const newAssigneeEngineer = await User.findOne({ userId: updatedTicket.assignee });
            console.log("newAssignedEngineer : ", newAssigneeEngineer);
            newAssigneeEngineer.ticketsAssigned.push(updatedTicket._id);

            await newAssigneeEngineer.save();
        }

        /**
         * If newAssigneeEngineer got updated then oldAssigneeEngineer must be updated by removing ticketId 
         */
        await User.updateOne({ userId: oldAssigneeEngineer }, { $pull: { ticketsAssigned: updatedTicket._id } })

        res.status(200).send(updatedTicket);
    } catch (err) {
        console.log("Some error while updating the ticket ", err.message);
        return res.status(500).send({
            message: "Some internal error while updating the ticket"
        })
    }
}
