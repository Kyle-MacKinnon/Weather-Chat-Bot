
var restify = require('restify');
var builder = require('botbuilder');
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

    // Location to find weather for
    var city = 'Auckland';

    // HTTP request options
    var options = {
        host: 'api.openweathermap.org',
        port: 80,
        path: '/data/2.5/weather?APPID=7eced897468f2ccff50a9c4decc7c529&q=' + city,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    // HTTP request callback
    function callback(result) {

        // Retrieve the JSON response
        result.on('data', function(data) {
            var response = JSON.parse(data);
            var city = response.name;
            var weather  = response.weather[0];

            session.send('## ' + city + '![](http://openweathermap.org/img/w/' + response.weather[0].icon +'.png)' + "\n" + weather.main);
        });
    }

    // Make request
    http.request(options, callback).end();
}

// Run bot using message handler
var bot = new builder.UniversalBot(connector, messageHandler)