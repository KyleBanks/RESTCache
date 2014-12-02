/**
 * web-service.js
 *
 * Handles HTTP(S) requests and routes them to cache actions.
 *
 * Created by kylewbanks on 2014-12-01.
 */

/**
 * Imports
 */
var express = require('express');
var Config = require('../conf/config');
var bodyParser = require('body-parser');
var log = require('./log');

/**
 * Global cache reference
 */
var cache = null;

/**
 * Server setup
 */
var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

/**
 * Define the routes
 */

// Returns PONG
app.get('/ping', function(req, res) {
    res.json([cache.ping()]);
});

// Accepts any number of key=value pairs in the URL, and sets them in the cache
app.get('/set', function(req, res) {

    // Pull out the key=value pairs
    var keyValueSets = req.query;

    // For each one, set it in the cache
    var output = [];
    for (var key in keyValueSets) {
        output.push(cache.set(key, keyValueSets[key]));
    }

    // Output a success message
    res.json(output);
});

// Accepts any number of keys in the URL, and returns them
app.get('/get', function(req, res) {

    // Iterate over the keys and pull out each value
    var query = req.query;

    var values = [];
    for (var key in query) {
        values.push(cache.get(key));
    }

    // Output the values
    res.json(values);
});

// Accepts any number of keys in the URL, and deletes them
app.get("/del", function(req, res) {
    // Iterate over the keys and delete each value
    var query = req.query;

    var output = [];
    for (var key in query) {
        output.push(cache.del(key));
    }

    // Output a success message
    res.json(output);
});

// Returns all of the keys in the cache. Currently doesn't support any parameters.
app.get('/keys', function(req, res) {
    var keys = cache.keys();
    res.json(keys);
});

// Accepts any number of keys (with optional corresponding values to increment by) and increments them in the cache.
app.get("/incr", function(req, res) {
    // Iterate over the keys and pull out each value
    var query = req.query;

    // Retrieve the values for each key
    var incrementedValues = [];
    for (var key in query) {

        // Get the value to increment by, if it's set
        var incrementBy = query[key];
        if (incrementBy.length == 0) {
            incrementBy = null;
        }

        // Make the call to increment, and check the response for an error message
        var response = cache.incr(key, incrementBy);
        if (response instanceof Error) {
            response = response.message;
        }

        incrementedValues.push(response);
    }

    // Output the responses
    res.json(incrementedValues);
});

// Accepts any number of keys (with optional corresponding values to increment by) and decrements them in the cache.
app.get('/decr', function(req, res) {
    // Iterate over the keys and pull out each value
    var query = req.query;

    // Retrieve the values for each key
    var decrementedValues = [];
    for (var key in query) {

        // Get the value to increment by, if it's set
        var decrementBy = query[key];
        if (decrementBy.length == 0) {
            decrementBy = null;
        }

        // Make the call to increment, and check the response for an error message
        var response = cache.decr(key, decrementBy);
        if (response instanceof Error) {
            response = response.message;
        }

        decrementedValues.push(response);
    }

    // Output the responses
    res.json(decrementedValues);
});

// Expires key(s) with given times to expire (from now) in milliseconds
app.get("/expire", function(req, res) {
    // Iterate over the keys and pull out each value
    var query = req.query;

    var output = [];
    for (var key in query) {
        output.push(cache.expire(key, query[key]));
    }

    res.json(output);
});

app.listen(Config.server.port);
console.log("Listening on port " + Config.server.port);


/**
 * Public
 */
module.exports.initialize = function(globalCache) {
    cache = globalCache;
};