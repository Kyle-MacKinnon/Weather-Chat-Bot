
/*
    Author: Kyle MacKinnon
    Date: 15/07/2017
    Description: Provides methods for pulling weather data from openweathermap.org
*/

var http = require('http');
var builder = require('botbuilder');

// API Key - Free Level
// Provides 60 requests a minute
var APPID = '7eced897468f2ccff50a9c4decc7c529&q';

// Replys to the user in the current session with the weather report for the specified city
exports.requestByCity = function requestByCity(city, session) {

    // Replace spaces in city with + sign
    // City must not have spaces as an HTTP parameter
    city = city.replace(/ /g, '+')

    // HTTP request options
    var options = {
        host: 'api.openweathermap.org',
        port: 80,
        path: '/data/2.5/weather?APPID=' + APPID + '=' + city.replace(/ /g, '+'),
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    // HTTP request callback
    function callback(result) {

        // If data in response
        result.on('data', function(data) {

            // Parse JSON object from data
            var response = JSON.parse(data);

            // Extract weather report
            var report = extractReport(response);

            // Send back report if city could be found
            if(report != null)  
            {
                session.send(report);
            
            } else {

                session.send("I wasn't able to find a city by that name.");
            }
        });
    }

    // Make request
    http.request(options, callback).end();
}

// Extracts weather report from JSON response
function extractReport(response) {

    // If city does not exist then return
    if(response.cod == "404") {
        return null;
    }

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