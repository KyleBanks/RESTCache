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

var standardSuccessResponse = {success: true};

/**
 * Define the routes
 */

// Accepts any number of key=value pairs in the URL, and sets them in the cache
app.get('/set', function(req, res) {

    // Pull out the key=value pairs
    var keyValueSets = req.query;

    // For each one, set it in the cache
    for (var key in keyValueSets) {
        cache.set(key, keyValueSets[key]);
    }

    // Output a success message
    res.json(standardSuccessResponse);
});

// Accepts any number of keys in the URL, and returns them
app.get('/get', function(req, res) {

    // Iterate over the keys and pull out each value
    var query = req.query;

    // Retrieve the values for each key
    var values = [];
    for (var key in query) {
        values.push(cache.get(key));
    }

    // Output the values
    res.json(values);
});

// Accepts any number of keys in the URL, and deletes them
app.get("/del", function(req, res) {
    // Iterate over the keys and pull out each value
    var query = req.query;

    // Retrieve the values for each key
    for (var key in query) {
        cache.del(key);
    }

    // Output a success message
    res.json(standardSuccessResponse);
});

// Returns all of the keys in the cache. Currently doesn't support any parameters.
app.get('/keys', function(req, res) {
    var keys = cache.keys();
    res.json(keys);
});

app.listen(Config.server.port);
console.log("Listening on port " + Config.server.port);


/**
 * Public
 */
module.exports.initialize = function(globalCache) {
    cache = globalCache;
};