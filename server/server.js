/**
 * server.js
 *
 * The main entry point of RESTCache, called to initialize the system.
 *
 * Created by kylewbanks on 2014-12-01.
 */

console.log("Initializing RESTCache...");

/**
 * Imports
 */
var Cache = require('./src/Cache');

/**
 * Initialize the cache
 */
var globalCache = new Cache();

/**
 * Initialize the interface(s)
 */
var webService = require('./src/http-server');
webService.initialize(globalCache);
