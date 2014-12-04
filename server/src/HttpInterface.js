/**
 * HttpInterface.js
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
var log = require('./misc/log');
var fs = require('fs');
var path = require('path');
var mergeParamsMiddleware = require('./misc/merge-params');

/**
 * HttpInterface Constructor
 * @constructor
 */
function HttpInterface() {
    this.moduleManager = null;
    this.server = null;
}

HttpInterface.prototype = {

    /**
     * Initializes and runs the HTTP(s) server, loads routes and extensions.
     */
    initialize: function() {
        // Initialize the Express.js Server
        this.server = express();

        // Set the middleware to use
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({
            extended: true
        }));
        this.server.use(mergeParamsMiddleware);

        // Load the routes and extensions
        this.initializeRoutesAndExtensions();

        // Start the server
        this.server.listen(Config.http.port);
        log.force("Listening on port " + Config.http.port);
    },

    /**
     * Loads the HttpRoute(s) located in the internal routes directory, as well as the
     * extensions directory.
     */
    initializeRoutesAndExtensions: function() {
        var $this = this;
        log.debug("Loading internal routes...");

        // Load internal routes
        var routesDir = path.join(__dirname, "/routes");
        var routePaths = fs.readdirSync(routesDir);

        var routes = [];
        routePaths.forEach(function(routeName) {
            var routePath = path.join(__dirname, "/routes/" + routeName);
            addRouteToArray(routes, require(routePath));
        });
        routePaths = null;

        // Load user extensions, if enabled
        if (Config.extensions.enabled) {
            var extensionDir = Config.extensions.directory;
            log.debug("Loading user extensions...");
            var extensionPaths = fs.readdirSync(extensionDir);

            extensionPaths.forEach(function(extensionName) {
                if (extensionName.indexOf(".js") != extensionName.length - ".js".length) {
                    return;
                }

                log.force("Injecting Extension: " + extensionName);
                var extensionPath = path.join("../"+extensionDir, extensionName);
                addRouteToArray(routes, require(extensionPath));
            });
            extensionPaths = null;
        }

        // Create the Express.js route for each HttpRoute loaded
        routes.forEach(function(route) {
            $this.server.all(route.path, function(req, res) {
                route.callback($this.moduleManager.getCache(), req, res);
            });
        });
    }

};

/**
 * Public
 */
module.exports = HttpInterface;

/**
 * Private Helpers
 */
function addRouteToArray(arr, newRoute) {

    // Check if the array contains an equal HttpRoute
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