"use strict";

require("dotenv").config({
    path: __dirname + "/.env",
});

const cors = require("cors");
const path = require("path");
const express = require("express");
const favicon = require('serve-favicon');

const app = express();
app.use(cors());

// Set Global
global.appRoot = __dirname;
global.server_url = process.env.APP_URL;

// Parsers for POST data
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.use(require("./src/services"));
app.use(favicon(__dirname + '/public/favicon.png'));

//set public folder path
app.use(express.static(__dirname + "/public"));
app.set(express.static(path.join(__dirname, "public/upload")));

// Check Server Cookies For Auth User
app.get('/*', (req, res, next) => {
   res.send("Welcome to Sample Api's --> This is only apis sample you can test it at postman")
   
});

// set the view engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.set(express.static(path.join(__dirname, "public/upload")));

//The 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
    return res.redirect("/");

});

/*** Get port from environment and store in Express. ***/
const http_port = process.env.http_port || "8001";
const httpServer = require('http').Server(app);
httpServer.listen(http_port, function () {
    console.log(`httpServer App started on port ${http_port}`);
});