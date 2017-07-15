
/*
    Author: Kyle MacKinnon
    Date: 15/07/2017
    Description: Initiates the chat bot and controls conversation flow.
*/

var restify = require('restify');
var builder = require('botbuilder');
var weather = require('./weather.js');
var http = require('http');

// Setup and run Restify web server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users at URL
server.post('/api/messages', connector.listen());

// Create a function for handling messages
function messageHandler(session) {

    // Make a weather request for the current session
    weather.requestByCity(session.message.text, session);
}

// Run bot using message handler
var bot = new builder.UniversalBot(connector, messageHandler);