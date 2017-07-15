
var http = require('http');
var builder = require('botbuilder');

// Replys to the user in the current session with the weather report for the specified city
exports.requestByCity = function requestByCity(city, session) {

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

        // If data in response
        result.on('data', function(data) {

            // Parse JSON object from data
            var response = JSON.parse(data);

            // Extract weather report and respond to user
            session.send(extractReport(response));
        });
    }

    // Make request
    http.request(options, callback).end();
}

// Extracts weather report from JSON response
function extractReport(response) {

    // Retrieve the first weather object available
    var weather = response.weather[0];
    var icons = ' ![](http://openweathermap.org/img/w/' + weather.icon + '.png)';
    var description = weather.description;

    // Retrieve any secondary weather object if available
    if(response.weather.length == 2) {

        weather = response.weather[1];
        icons += ' ![](http://openweathermap.org/img/w/' + weather.icon + '.png)';
        description += ' with ' + weather.description;
    }

    // Cap off description
    description += '.';

    // Return full report
    return '## ' + response.name + icons + '\n' + "Today's weather is " + description;
}