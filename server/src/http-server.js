/**
 * http-server.js
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
var fs = require('fs');
var path = require('path');

/**
 * Global cache reference
 */
var cache = null;

/**
 * Server setup
 */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * Load the internal routes
 */
log.info("Loading internal routes...");

var routesDir = path.join(__dirname, "/routes");
var routePaths = fs.readdirSync(routesDir);

log.info("Found " + routePaths.length + " internal routes.");

var routes = [];
routePaths.forEach(function(routeName) {
    var routePath = path.join(__dirname, "/routes/" + routeName);
    routes.push(require(routePath));
});
routePaths = null;


// Creates an external route for a given Route object
routes.forEach(function(route) {
    log.info(route.path);
    app.get(route.path, function(req, res) {
        route.callback(cache, req, res);
    });
});

log.info("Routes initialized.");

/**
 * Start the web server
 */
app.listen(Config.server.port);
log.force("Listening on port " + Config.server.port);

/**
 * Public
 */
module.exports.initialize = function(globalCache) {
    cache = globalCache;
};