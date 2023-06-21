/**
 * This file is going to contain the logic for the integration testing of user.route.test.js
 */
const db = require("../db")
const jwt = require("jsonwebtoken")
const config = require("../../configs/auth.config")
const request = require("supertest")
const app = require("../../server")
const User = require("../../models/user.model")
/**
 * Insert the data inside the test db
 */

let token;
beforeAll(async () => {
    console.log("Before all the test run");
    // Generate the token to be used for sending the request for Auth
    token = jwt.sign({ id: "babai01" }, config.secret, {
        expiresIn: 120
    });
    /**
     * Insert the data inside the test db
     */
    await db.clearDatabase();

    await User.create({
        name: "Babai",
        userId: "babai01",
        email: "babai@gmail.com",
        userType: "ADMIN",
        password: "budha",
        userStatus: "APPROVED"
    })
})

/**
 * Cleanup of the project when everything is completed
 */
afterAll(async () => {
    console.log("After all the code has been executed");
    await db.closeDatabase();
})



/**
 *  Integration testing for all the users endpoint      /crm/api/v1/users
 */

describe("Find all users", () => {

    it("find all the users", async () => {

        /**
         * 1. We need to have some data in the test DB | Done in the beforeAll method
         * 2. Generate the token using the same logic and use for the test
         */

        // Set up the necessary conditions for each test case
        const validUserId = "babai01";

        // Simulate the middleware behavior by calling the middleware functions manually
        let isAdmin = false;

        // Middleware : isAdmin
        try {
            const user = await User.findOne({ userId: validUserId })

            if (user && user.userType == "ADMIN") {
                isAdmin = true;
            }
        } catch (err) {
            console.log("Error while reading the user info", err.message);
        }

        //Need to invoke the API   -- We need to make use of supertest
        const res = await request(app).get("/crm/api/v1/users").set("x-access-token", token)

        // Assert the behavior of the middlewares
        expect(isAdmin).toBe(true);

        //Code for the validation
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    "name": "Babai",
                    "userId": "babai01",
                    "email": "babai@gmail.com",
                    "userType": "ADMIN",
                    "userStatus": "APPROVED"
                })
            ])
        )

    })
});

describe("Find user based on userId", () => {
    it("test the endpoint /crm/api/v1/users/:id", async () => {

        // Set up the necessary conditions for each test case
        const validUserId = "babai01";

        // Simulate the middleware behavior by calling the middleware functions manually
        let isUserIdValid = false;
        let isAdminOrOwner = false;

        // Middleware 1: isValidUserIdReqParam
        try {
            const user = await User.find({ userId: validUserId });
            if (user) {
                isUserIdValid = true;
            }
        } catch (err) {
            console.log("Error while reading the user info", err.message);
        }

        // Middleware 2: isAdminOrOwner
        try {
            const callingUser = await User.findOne({ userId: validUserId });
            if (
                callingUser.userType === "ADMIN" ||
                callingUser.userId === validUserId
            ) {
                isAdminOrOwner = true;
            }
        } catch (err) {
            console.log("Error while reading the user info", err.message);
        }

        //Execution of the code
        const res = await request(app).get("/crm/api/v1/users/babai01").set("x-access-token", token)

        // Assert the behavior of the middlewares
        expect(isUserIdValid).toBe(true);
        expect(isAdminOrOwner).toBe(true);

        //Code for the validation
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    "name": "Babai",
                    "userId": "babai01",
                    "email": "babai@gmail.com",
                    "userType": "ADMIN",
                    "userStatus": "APPROVED"
                })
            ])
        )

    })
})

describe("Update user based on userId", () => {
    it("test the endpoint /crm/api/v1/users/:id", async () => {

        // Set up the necessary conditions for each test case
        const validUserId = "babai01";

        // Simulate the middleware behavior by calling the middleware functions manually
        let isUserIdValid = false;
        let isAdminOrOwner = false;

        // Middleware 1: isValidUserIdReqParam
        try {
            const user = await User.find({ userId: validUserId });
            if (user) {
                isUserIdValid = true;
            }
        } catch (err) {
            console.log("Error while reading the user info", err.message);
        }

        // Middleware 2: isAdminOrOwner
        try {
            const callingUser = await User.findOne({ userId: validUserId });
            if (
                callingUser.userType === "ADMIN" ||
                callingUser.userId === validUserId
            ) {
                isAdminOrOwner = true;
            }
        } catch (err) {
            console.log("Error while reading the user info", err.message);
        }

        //Execution for the validation
        const res = await request(app).put("/crm/api/v1/users/babai01").set("x-access-token", token)

        // Assert the behavior of the middlewares
        expect(isUserIdValid).toBe(true);
        expect(isAdminOrOwner).toBe(true);

        //Code for the validation
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                "name": "Babai",
                "userId": "babai01",
                "email": "babai@gmail.com",
                "userType": "ADMIN",
                "userStatus": "APPROVED"
            })
        )

    })
})