/**
 * Execute a simple load test
 *
 * Options:
 *      -h URL of the RESTCache server to connect to. (Optional: Defaults to "http://localhost:7654")
 *      -c The number of times to hit the RESTCache server (Required)
 */


/**
 * Imports
 */
var RCClient = require("../client/RCClient");

/**
 * Setup - Pull out command line arguments
 */
var serverUrl = "http://localhost:7654";
var callCount = null;
process.argv.forEach(function (arg) {
    if (arg.indexOf('-h=') == 0) {
        serverUrl = arg.split("-h=")[1];
    } else if (arg.indexOf('-c=') == 0) {
        callCount = arg.split('-c=')[1];
    }
});

if (callCount == null || isNaN(callCount)) {
    throw new Error("ERROR: Call Count (-c) required.")
}
callCount = parseInt(callCount);

var client = new RCClient(serverUrl, { debug: false, mode: "POST" });

// Initialize the base key/value format to be used for the test
var key = 'Load Test Key ',
    value = 'Load Test Value ';

/**
 * Recursively call SET until the callsRemaining reaches zero
 */
function callSet(callsRemaining) {

    client.set(key + callsRemaining, value + callsRemaining, function(err, res) {
        if (err.length > 0) {
            throw err[0];
        } else {
           if (res == null || typeof res === 'undefined') {
               console.error("RESTCache failed to return a response!");
               throw new Error("RESTCache failed with " + callsRemaining + " requests remaining in the test.");
           }
        }

        callsRemaining --;
        if (callsRemaining > 0) {
            if (callsRemaining % 1000 == 0) {
                console.log((callCount - callsRemaining) + " requests completed...");
            }
            callSet(callsRemaining);
        } else {
            var completionTime = ((new Date().getTime() - startTime.getTime()) / 1000);
            console.log("Test Complete");
            console.log(callCount + " requests in " + completionTime + "s.");
            console.log((callCount/completionTime) + " requests/second.");
        }
    });
}

var startTime = new Date();
callSet(callCount);