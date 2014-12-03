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

var routes = [];
routePaths.forEach(function(routeName) {
    var routePath = path.join(__dirname, "/routes/" + routeName);
    addRouteToArray(routes, require(routePath));
});
routePaths = null;

log.info("Routes initialized.");


/**
 * Load user extensions
 */
log.info("Loading user extensions...");

var extensionDir = path.join(__dirname, "/../extensions");
var extensionPaths = fs.readdirSync(extensionDir);

extensionPaths.forEach(function(extensionName) {
    if (extensionName.indexOf(".js") != extensionName.length - ".js".length) {
        return;
    }

    log.force("Injecting Extension: " + extensionName);
    var extensionPath = path.join(__dirname, "/../extensions/" + extensionName);
    addRouteToArray(routes, require(extensionPath));
});
extensionPaths = null;

/**
 * Initialize the internal routes and user extensions
 */
routes.forEach(function(route) {
    app.get(route.path, function(req, res) {
        route.callback(cache, req, res);
    });
});
routes = null;

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


/**
 * Private Helpers
 */
function addRouteToArray(arr, newRoute) {

    // Check if the array contains an equal HTTPRoute
    var curIndex = -1;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].equals(newRoute)) {
            curIndex = i;
            break;
        }
    }

    // If it does, replace the existing one, otherwise just add the new route
    if (curIndex >= 0) {
        arr[curIndex] = newRoute;
    } else {
        arr.push(newRoute);
    }
}