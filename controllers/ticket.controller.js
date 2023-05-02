/**
 * This file should have the logic to create controller for Ticket resource
 */

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
 */

const User = require("../models/user.model");
const Ticket = require("../models/ticket.model");
const constants = require("../utils/constants");

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
         * Insert the ticket Object
         *      - Insert that ticket id in customer and engineer document
         */

        const ticketCreated = await Ticket.create(ticketObj);

        if (ticketCreated) {

            // Update the Customer document
            const customer = User.findOne({
                userId: req.userId
            });

            customer.ticketsCreated.push(ticketCreated._id);
            await customer.save();

            // Update the Engineer document
            if (engineer) {
                engineer.ticketsAssigned.push(ticketCreated._id);
                await engineer.save();
            }

            res.status(201).send(ticketCreated);
        }

    } catch (err) {
        console.log("Error while doing the DB operation ", err.message);
        res.status(500).send({
            message: "Internal server error ! "
        })
    }

} 