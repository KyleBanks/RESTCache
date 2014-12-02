/**
 * Execute ALL test scripts
 */


/**
 * Imports
 */
var RESTCache = require("../client/Client");
var async = require('async');
var assert = require('assert');

/**
 * Setup
 */
var serverUrl = "http://localhost:7654"; // TODO: Retrieve from command-line

// Initialize the RESTCache client
var client = new RESTCache(serverUrl, false);

// Define some test keys/values
var singleKey = "testSetGet",
    singleValue = "tested",
    unknownKey = "unknownKey",
    multiSetKey1 = "key1",
    multiSetKey2 = "key2",
    multiSetKey3 = "key3",
    multiSetValue1 = "1",
    multiSetValue2 = "2",
    multiSetValue3 = "3";

// Execute the test scripts in parallel
console.log("------------------------------");
console.log("Executing all test scripts on:");
console.log(serverUrl);
console.log("------------------------------");

async.series([

    /**
     * Tests single SET
     */
     function(cb) {
        client.set(singleKey, singleValue, function(error, response) {
            assert.equal(error, null, "SET returned an error: " + error);
            assert.equal(response.success, true, "Failed to call SET!");

            console.log("SET: OK");
            cb(null, true);
        });
     },

    /**
     * Tests single GET
     */
     function(cb) {
        client.get(singleKey, function(error, response) {
            assert.equal(error, null, "GET returned an error: " + error);
            assert.equal(response.length, 1, "GET returned the wrong number of values: " + response.length);
            assert.equal(response[0], singleValue, "GET returned the wrong value: " + singleValue + " !+ " + response[0]);

            console.log("GET: OK");
            cb(null, true);
        });
     },

    /**
     * Tests KEYS
     */
     function (cb) {
        client.keys(function(error, response) {
            assert.equal(error, null, "KEYS returned an error: " + error);
            assert.notEqual(response.indexOf(singleKey), -1, "KEYS didn't contain " + singleKey + " !");

            console.log("KEYS: OK");
            cb(null, true);
        });
     },

    /**
     * Tests invalid GET (key doesn't exist)
     */
     function(cb) {
        client.get(unknownKey, function(error, response) {
            assert.equal(error, null, "GET Invalid Key returned an error: " + error);
            assert.equal(response.length, 1, "GET Invalid Key returned the wrong number of values: " + response.length);
            assert.equal(response[0], null, "Get Invalid Key returned a non-null response!");

            console.log("Invalid GET: OK");
            cb(null, true);
        });
     },

    /**
     * Tests a multi-SET
     */
     function(cb) {
        client.set(
            [multiSetKey1, multiSetKey2, multiSetKey3],
            [multiSetValue1, multiSetValue2, multiSetValue3],
            function(error, response) {
                assert.equal(error, null, "Multi-SET returned an error: " + error);
                assert.equal(response.success, true, "Multi-SET command failed!");

                console.log("Multi-SET: OK");
                cb(null, true);
            }
        );
     },

    /**
     * Tests a multi-GET
     */
     function(cb) {
        client.get([multiSetKey1, multiSetKey2, multiSetKey3], function(error, response) {
            assert.equal(error, null, "Multi-GET returned an error: " + error);
            assert.equal(response.length, 3, "Multi-GET Returned the wrong number of values: " + response.length);
            assert.equal(response[0], multiSetValue1, "Multi-GET command failed at key 1!");
            assert.equal(response[1], multiSetValue2, "Multi-GET command failed at key 2!");
            assert.equal(response[2], multiSetValue3, "Multi-GET command failed at key 3!");

            console.log("Multi-GET: OK");
            cb(null, true);
        });
     },

    /**
     * Tests a single DEL
     */
    function(cb) {
        client.del(singleKey, function(error, response) {
            assert.equal(error, null, "DEL returned an error: " + error);
            assert.equal(response.success, true, "Failed to call DEL!");

            console.log("GET: OK");
            cb(null, true);
        });
    },

    /**
     * Tests KEYS on a deleted KEY
     */
    function(cb) {
        client.keys(function(error, response) {
            assert.equal(error, null, "KEYS (on deleted KEY) returned an error: " + error);
            assert.equal(response.indexOf(singleKey), -1, "KEYS contained deleted key: " + singleKey + " !");

            console.log("KEYS (on deleted KEY): OK");
            cb(null, true);
        });
    },

    /**
     * Tests GET on a deleted key
     */
    function(cb) {
        client.get(singleKey, function(error, response) {
            assert.equal(error, null, "GET Deleted Key returned an error: " + error);
            assert.equal(response.length, 1, "GET Deleted Key returned the wrong number of values: " + response.length);
            assert.equal(response[0], null, "Get Deleted Key returned a non-null response!");

            console.log("Deleted GET: OK");
            cb(null, true);
        });
    },

    /**
     * Tests a multi-DEL
     */
    function(cb) {
        client.del([multiSetKey1, multiSetKey2, multiSetKey3], function(error, response) {
            assert.equal(error, null, "Multi-DEL returned an error: " + error);
            assert.equal(response.success, true, "Failed to call Multi-DEL!");

            console.log("GET: OK");
            cb(null, true);
        });
    },

    /**
     * Tests GET on multiple deleted keys
     */
     function(cb) {
        client.get([multiSetKey1, multiSetKey2, multiSetKey3], function(error, response) {
            assert.equal(error, null, "Multi-GET Deleted Key returned an error: " + error);
            assert.equal(response.length, 3, "Multi-GET Deleted Key returned the wrong number of values: " + response.length);
            assert.equal(response[0], null, "Multi-Get Deleted Key returned a non-null response!");
            assert.equal(response[1], null, "Multi-Get Deleted Key returned a non-null response!");
            assert.equal(response[2], null, "Multi-Get Deleted Key returned a non-null response!");

            console.log("Deleted Multi-GET: OK");
            cb(null, true);
        });
     },

], function (error, results) {
    // Check the results of each test to ensure all are successful
    var isSuccessful = true;
    for (var success in results) {
        if (! success) {
            isSuccessful = false;
        }
    }

    console.log("------------------------------");
    console.log("All Tests: " + (isSuccessful ? "OK":"FAIL"));
    console.log("------------------------------");

    if (!isSuccessful) {
        console.log("Ensure an empty cache before running tests.");
    }
});