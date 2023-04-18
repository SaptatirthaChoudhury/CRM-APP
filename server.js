/**
 * This is going to be the starting point of the application
 */

const express = require('express')
const app = express()
const serverConfig = require('./configs/server.config')
const dbConfig = require('./configs/db.config');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * DB Connection initialization
 */


mongoose.connect(dbConfig.DB_URL);
const db = mongoose.connection;
db.on("error", () => {
    console.log("error while connecting to DB");
});
db.once("open", () => {
    console.log("connected to Mongo DB ")
    init();
});


async function init() {


    var user = await User.findOne({ userId: "admin" });

    if (user) {
        console.log("Admin user already present");
        return;
    }

    try {

        user = await User.create({
            name: "Mohor2",
            userId: "admin",
            email: "mohor2@gmail.com",
            userType: "ADMIN",
            password: bcrypt.hashSync("hello245", 8)

        });
        console.log(user);

    } catch (e) {
        console.log(e.message);
    }

}

/**
 * importing the routes and connect to the server
 */
const authRoute = require('./routes/auth.route');
authRoute(app);
const userRoute = require('./routes/user.route');
userRoute(app);


app.listen(serverConfig.PORT, () => {

    console.log(`Started the server on the PORT number : ${serverConfig.PORT}`);
}) 