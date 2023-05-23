/**
 * This file should have the logic to connect to the Notification
 */

var Client = require("node-rest-client").Client;

var client = new Client(); // This is the client object which will be used for calling the REST APIs 

/**
 * Exposing a method which take the request parameters for sending the notification to the notification service
 */
module.exports = (subject, content, recepients, requester) => {

    /**
     *  Create the request body
     */
    const reqBody = {
        subject: subject,
        recepientEmails: recepients,
        content: content,
        requester: requester
    }

    /**
     * Prepare the headers
     */
    const reqHeader = {
        "Content-Type": "application/json"
    }

    /**
     * Combine headers and req body together
     */
    const args = {
        data: reqBody,
        headers: reqHeader
    }

    /**
     * Make a POST call and handle the response
     * 
     * URI should go in the env file
     */
    client.post("http://localhost:8000/notifyservice/api/v1/notifications", args, (data, res) => {

        console.log("Request sent");
        console.log(`data : ${data}, response : ${res}`);
    })
}