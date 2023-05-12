/**
 * Route logic for the ticket resource
 */

const ticketController = require("../controllers/ticket.controller");
const { authJwt, validUser } = require("../middlewares")

module.exports = (app) => {

    /**
     * Create a ticket
     * 
     * POST /crm/api/v1/tickets/
     * Add a middleware for request body validation of ticket
     * And add another middleware for check is there any available engineer or not.
     */
    app.post("/crm/api/v1/tickets/", [authJwt.verifyToken], ticketController.createTicket)

    /**
     * User should see the tickets like :
     * 
     * If user is admin then he/she can see all the tickets of reporter and assignee ------
     * Or if user is customer then he/she can see all the tickets created by him/her -------
     * Or if user is engineer then he/she can see all the tickets assigned to him/her -------
     */
    app.get("/crm/api/v1/tickets/", [authJwt.verifyToken], ticketController.getAllTickets)

    /**
     * Privilages according to user to update the endpoint
     */
    app.put("/crm/api/v1/tickets/:id", [authJwt.verifyToken, validUser.checkForValidUser], ticketController.updateTickets)
} 