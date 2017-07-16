
/*
    Author: Kyle MacKinnon
    Date: 15/07/2017
    Description: Initializes the chat bot and dialogs
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

// Run bot 
var bot = new builder.UniversalBot(connector, 
    
    // Default function for all new sessions
    function (session) {

        // Take the user's message as lower case
        var input = session.message.text.toLowerCase()

        // If they gave either greeting begin the dialog
        if(input == 'hello' || input == 'hi') {

            // Start conversation with the user
            session.beginDialog('weatherQuestion');
        }

        // Let the user know how to begin a conversation
        else {
            session.send("Say **hi** or **hello** to start a conversation.");
        }
    }
);

// Does the user want a weather report?
bot.dialog('weatherQuestion', [

    // Ask the user if they want a weather report
    function (session) {
        builder.Prompts.choice(session, 'Hi there, would you like to know the weather in your city?', ['Yes','No'], { listStyle: builder.ListStyle["button"]});
    },

    // Route response to appropriate dialog
    function(session, results) {

        switch(results.response.entity) {

            case 'Yes' : session.beginDialog('chooseCity'); return;
            case 'No' : session.endDialog("That's okay, say hi again when you do."); return;
            default : session.endDialog(); return;
        }
    }
]);

// They want the weather report, find out what city
bot.dialog('chooseCity', [ 
    
    // Ask user what city
    function(session) {
        builder.Prompts.text(session, "What city would you like a weather report for?");
    },
    
    // Capture response
    function(session, results) {
        
        // Request weather report for current session, redirect to repeatQuestion when report comes through
        weather.requestByCity(session, results.response, 'repeatQuestion');

        // It may take a while for that report to come through
        // If the stack hasn't been changed, the report hasn't come through so move onto the waiting dialog
        if(session.dialogStack().pop().id != 'repeatQuestion') {

            // Make sure the user is only notified when sending new messages while waiting
            session.message.text = "";
            session.replaceDialog('waitForReport');
        }

        
    }
]);

// In the event the weather report takes a long time to load
bot.dialog('waitForReport', [

    function(session) {
        if(session.message.text.length > 0) {
            session.send("Your weather report will be ready in one moment.");
        }
    }
])

// Ask user again if they would like another city
bot.dialog('repeatQuestion', [

    // Would they like the weather report?
    function (session) {
        builder.Prompts.choice(session, 'Would you like a weather report for another city?', ['Yes','No'], { listStyle: builder.ListStyle["button"]});
    },

    // Route response to appropriate dialog
    function(session, results) {
        
        switch(results.response.entity) {

            case 'Yes': session.replaceDialog('chooseCity'); return;
            case 'No': session.endDialog("That's okay, feel free to say hi again."); return;
            default: session.endDialog(); return;
        }
    }
]);