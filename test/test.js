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
var serverUrl = "http://localhost:7654"; // TODO: Retrieve from command-line args

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
    multiSetValue3 = "3",

    incrSingleKey = "incr-knownKey",
    incrSingleValue = "10",
    incrUnknownKey = "incr-unknownKey",
    incrMultiSetKey1 = "incr-key1",
    incrMultiSetKey2 = "incr-key2",
    incrMultiSetKey3 = "incr-key3",
    incrMultiSetValue1 = "1",
    incrMultiSetValue2 = "2",
    incrMultiSetValue3 = "3",

    expireSingleKey = "expire-knownKey",
    expireSingleValue = "expire-knownValue",
    expireMultiSetKey1 = "expire-key1",
    expireMultiSetKey2 = "expire-key2",
    expireMultiSetKey3 = "expire-key3",
    expireMultiSetValue1 = "1",
    expireMultiSetValue2 = "2",
    expireMultiSetValue3 = "3";

// Execute the test scripts in parallel
console.log("------------------------------");
console.log("Executing all test scripts on:");
console.log(serverUrl);
console.log("------------------------------");

async.series([

    /**
     * Tests PING
     * @param cb
     */
     function(cb) {
         client.ping(function(error, response) {
             assert.equal(error, null, "PING returned an error: " + error);
             assert.equal(response.length, 1, "PING did not return 1 response: " + response.length);
             assert.equal(response[0], "PONG", "PING did not return PONG: " + response[0]);

             console.log("PING: OK");
             cb(null, true);
         });
     },

    /**
     * Tests single SET
     */
     function(cb) {
        client.set(singleKey, singleValue, function(error, response) {
            assert.equal(error, null, "SET returned an error: " + error);
            assert.equal(response.length, 1, "SET did not return 1 response: " + response.length);
            assert.equal(response[0], true, "Failed to call SET!");

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
                assert.equal(response.length, 3, "Multi-SET returned the wrong number of responses: " + response.length);
                assert.equal(response[0], true, "Multi-SET command failed!");
                assert.equal(response[1], true, "Multi-SET command failed!");
                assert.equal(response[2], true, "Multi-SET command failed!");

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
            assert.equal(response.length, 1, "DEL did not return 1 response: ", response.length);
            assert.equal(response[0], true, "Failed to call DEL!");

            console.log("GET: OK");
            cb(null, true);
        });
    },

    /**
     * Tests KEYS on a deleted KEY
     */
    function(cb) {
        client.keys(function(error, response) {
            assert.equal(error, null, "KEYS (Deleted KEY) returned an error: " + error);
            assert.equal(response.indexOf(singleKey), -1, "KEYS (Deleted KEY) contained the deleted key: " + singleKey + " !");

            console.log("KEYS (Deleted KEY): OK");
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
            assert.equal(response.length, 3, "Multi-DEL returned the wrong number of responses: " + response.length);
            assert.equal(response[0], true, "Failed to call Multi-DEL!");
            assert.equal(response[1], true, "Failed to call Multi-DEL!");
            assert.equal(response[2], true, "Failed to call Multi-DEL!");

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

    /**
     * Tests INCR on a single key with default incrementBy value
     * @param cb
     */
     function(cb) {
        client.set(incrSingleKey, incrSingleValue, function(error, response) {

            // Test the default INCR (1)
            client.incr(incrSingleKey, null, function(error, response) {
                assert.equal(error, null, "INCR Single Key (Default Value) returned an error: " + error);
                assert.equal(response.length, 1, "INCR Single Key (Default Value) returned the wrong number of values: " + response.length);
                assert.equal(isNaN(response[0]), false, "INCR Single Key (Default Value) did not return a numeric response: " + response[0]);
                assert.equal(parseInt(response[0]), parseInt(incrSingleValue) + 1, "INCR Single Key (Default Value) did not return " + (parseInt(incrSingleValue) + 1) + ": " + parseInt(response[0]));

                console.log("INCR Single Key (Default Value): OK");
                cb(null, true);
            });
        });
     },

    /**
     * Tests INCR on an unknown KEY
     * @param cb
     */
     function(cb) {
        client.incr(incrUnknownKey + new Date().getMilliseconds(), null, function(error, response) {
            assert.equal(error, null, "INCR Unknown Key returned an error: " + error);
            assert.equal(response.length, 1, "INCR Unknown Key returned the wrong number of values: " + response.length);
            assert.equal(isNaN(response[0]), false, "INCR Unknown Key did not return a numeric response");
            assert.equal(parseInt(response[0]), 1, "INCR Unknown Key did not return 1: " + response[0]);

            console.log("INCR Unknown Key: OK");
            cb(null, true);
        });
     },

    /**
     * Tests INCR on an invalid (string) value
     * @param cb
     */
     function(cb) {
         client.set(singleKey, singleValue, function(error, response) {

             client.incr(singleKey, null, function(error, response) {
                 assert.equal(error, null, "INCR Invalid Value returned an error: " + error);
                 assert.equal(response.length, 1, "INCR Invalid Value returned the wrong number of values: " + response.length);
                 assert.equal(response[0].toString().substring(0, 5), "ERROR", "INCR Invalid Value did not return an error: [" + response[0] + "]");

                 console.log("INCR Invalid Value: OK");
                 cb(null, true);
             });
         });
     },

    /**
     * Tests Multi-INCR
     * @param cb
     */
     function(cb) {
         client.set(
             [incrMultiSetKey1, incrMultiSetKey2, incrMultiSetKey3],
             [incrMultiSetValue1, incrMultiSetValue2, incrMultiSetValue3],
             function(error, response) {

                 var incr1By = 4,
                     incr2By = 2,
                     incr3By = -2;

                 client.incr([incrMultiSetKey1, incrMultiSetKey2, incrMultiSetKey3], [incr1By, incr2By, incr3By], function(error, response) {
                     assert.equal(error, null, "Multi-INCR returned an error: " + error);
                     assert.equal(response.length, 3, "Multi-INCR returned the wrong number of values: " + response.length);
                     assert.equal(response[0], parseInt(incrMultiSetValue1) + incr1By, "Multi-INCR returned the wrong value for KEY '" + incrMultiSetKey1 + "': " + response[0]);
                     assert.equal(response[1], parseInt(incrMultiSetValue2) + incr2By, "Multi-INCR returned the wrong value for KEY '" + incrMultiSetKey2 + "': " + response[1]);
                     assert.equal(response[2], parseInt(incrMultiSetValue3) + incr3By, "Multi-INCR returned the wrong value for KEY '" + incrMultiSetKey3 + "': " + response[2]);

                     console.log("Multi-INCR: OK");
                     cb(null, true);
                 });
             }
         );
     },

    /**
     * Tests Multi-INCR with Default Increment
     * @param cb
     */
     function(cb) {
        client.set(
            [incrMultiSetKey1, incrMultiSetKey2, incrMultiSetKey3],
            [incrMultiSetValue1, incrMultiSetValue2, incrMultiSetValue3],
            function(error, response) {


                client.incr([incrMultiSetKey1, incrMultiSetKey2, incrMultiSetKey3], null, function(error, response) {
                    assert.equal(error, null, "Multi-INCR (Default Increment) returned an error: " + error);
                    assert.equal(response.length, 3, "Multi-INCR (Default Increment) returned the wrong number of values: " + response.length);
                    assert.equal(response[0], parseInt(incrMultiSetValue1) + 1, "Multi-INCR (Default Increment) returned the wrong value for KEY '" + incrMultiSetKey1 + "': " + response[0]);
                    assert.equal(response[1], parseInt(incrMultiSetValue2) + 1, "Multi-INCR (Default Increment) returned the wrong value for KEY '" + incrMultiSetKey2 + "': " + response[1]);
                    assert.equal(response[2], parseInt(incrMultiSetValue3) + 1, "Multi-INCR (Default Increment) returned the wrong value for KEY '" + incrMultiSetKey3 + "': " + response[2]);

                    console.log("Multi-INCR (Default Increment): OK");
                    cb(null, true);
                });
            }
        );
     },

    /**
     * Tests DECR on a single key with default decrementBy value
     * @param cb
     */
     function(cb) {
        client.set(incrSingleKey, incrSingleValue, function(error, response) {

            client.decr(incrSingleKey, null, function(error, response) {
                assert.equal(error, null, "DECR Single Key (Default Value) returned an error: " + error);
                assert.equal(response.length, 1, "DECR Single Key (Default Value) returned the wrong number of values: " + response.length);
                assert.equal(isNaN(response[0]), false, "DECR Single Key (Default Value) did not return a numeric response: " + response[0]);
                assert.equal(parseInt(response[0]), parseInt(incrSingleValue) - 1, "DECR Single Key (Default Value) did not return " + (parseInt(incrSingleValue) - 1) + ": " + parseInt(response[0]));

                console.log("DECR Single Key (Default Value): OK");
                cb(null, true);
            });
        });
     },

    /**
     * Tests DECR on an unknown KEY
     * @param cb
     */
     function(cb) {
        client.decr(incrUnknownKey + new Date().getMilliseconds(), null, function(error, response) {
            assert.equal(error, null, "DECR Unknown Key returned an error: " + error);
            assert.equal(response.length, 1, "DECR Unknown Key returned the wrong number of values: " + response.length);
            assert.equal(isNaN(response[0]), false, "DECR Unknown Key did not return a numeric response");
            assert.equal(parseInt(response[0]), -1, "DECR Unknown Key did not return -1: " + response[0]);

            console.log("DECR Unknown Key: OK");
            cb(null, true);
        });
     },

    /**
     * Tests DECR on an invalid (string) value
     * @param cb
     */
     function(cb) {
        client.set(singleKey, singleValue, function(error, response) {

            client.decr(singleKey, null, function(error, response) {
                assert.equal(error, null, "DECR Invalid Value returned an error: " + error);
                assert.equal(response.length, 1, "DECR Invalid Value returned the wrong number of values: " + response.length);
                assert.equal(response[0].toString().substring(0, 5), "ERROR", "DECR Invalid Value did not return an error: [" + response[0] + "]");

                console.log("DECR Invalid Value: OK");
                cb(null, true);
            });
        });
     },

    /**
     * Tests Multi-DECR
     * @param cb
     */
     function(cb) {
        client.set(
            [incrMultiSetKey1, incrMultiSetKey2, incrMultiSetKey3],
            [incrMultiSetValue1, incrMultiSetValue2, incrMultiSetValue3],
            function(error, response) {

                var incr1By = 4,
                    incr2By = 2,
                    incr3By = -2;

                client.decr([incrMultiSetKey1, incrMultiSetKey2, incrMultiSetKey3], [incr1By, incr2By, incr3By], function(error, response) {
                    assert.equal(error, null, "Multi-DECR returned an error: " + error);
                    assert.equal(response.length, 3, "Multi-DECR returned the wrong number of values: " + response.length);
                    assert.equal(response[0], parseInt(incrMultiSetValue1) - incr1By, "Multi-DECR returned the wrong value for KEY '" + incrMultiSetKey1 + "': " + response[0]);
                    assert.equal(response[1], parseInt(incrMultiSetValue2) - incr2By, "Multi-DECR returned the wrong value for KEY '" + incrMultiSetKey2 + "': " + response[1]);
                    assert.equal(response[2], parseInt(incrMultiSetValue3) - incr3By, "Multi-DECR returned the wrong value for KEY '" + incrMultiSetKey3 + "': " + response[2]);

                    console.log("Multi-DECR: OK");
                    cb(null, true);
                });
            }
        );
     },

    /**
     * Tests Multi-DECR with Default Increment
     * @param cb
     */
     function(cb) {
        client.set(
            [incrMultiSetKey1, incrMultiSetKey2, incrMultiSetKey3],
            [incrMultiSetValue1, incrMultiSetValue2, incrMultiSetValue3],
            function(error, response) {


                client.decr([incrMultiSetKey1, incrMultiSetKey2, incrMultiSetKey3], null, function(error, response) {
                    assert.equal(error, null, "Multi-DECR (Default Increment) returned an error: " + error);
                    assert.equal(response.length, 3, "Multi-DECR (Default Increment) returned the wrong number of values: " + response.length);
                    assert.equal(response[0], parseInt(incrMultiSetValue1) - 1, "Multi-DECR (Default Increment) returned the wrong value for KEY '" + incrMultiSetKey1 + "': " + response[0]);
                    assert.equal(response[1], parseInt(incrMultiSetValue2) - 1, "Multi-DECR (Default Increment) returned the wrong value for KEY '" + incrMultiSetKey2 + "': " + response[1]);
                    assert.equal(response[2], parseInt(incrMultiSetValue3) - 1, "Multi-DECR (Default Increment) returned the wrong value for KEY '" + incrMultiSetKey3 + "': " + response[2]);

                    console.log("Multi-DECR (Default Increment): OK");
                    cb(null, true);
                });
            }
        );
     },

    /**
     * Tests EXPIRE
     * @param cb
     */
     function(cb) {
         client.set(expireSingleKey, expireSingleValue, function(error, response) {

             // Set the expire time
             client.expire(expireSingleKey, 3000, function(error, response) {
                 assert.equal(error, null, "EXPIRE returned an error: " + error);
                 assert.equal(response.length, 1, "EXPIRE returned the wrong number of values: " + response.length);
                 assert.equal(response[0], true, "EXPIRE did not return true: " + response[0]);

                 // Get the value before it expires
                 client.get(expireSingleKey, function(error, response) {
                     assert.equal(error, null, "GET after EXPIRE returned an error: " + error);
                     assert.equal(response.length, 1, "GET after EXPIRE returned the wrong number of values: " + response.length);
                     assert.equal(response[0], expireSingleValue, "GET after EXPIRE did not return the right value: " + response[0]);

                     setTimeout(function() {
                         // Get the value after it expires
                         client.get(expireSingleKey, function(error, response) {
                             assert.equal(error, null, "GET after EXPIRE Complete returned an error: " + error);
                             assert.equal(response.length, 1, "GET after EXPIRE Complete returned the wrong number of values: " + response.length);
                             assert.equal(response[0], null, "GET after EXPIRE Complete did not return the right value: " + response[0]);

                             console.log("EXPIRE: OK");
                             cb(null, true);
                         });

                     }, 3000);
                 });
             });

         });
     },

    /**
     * Tests Multi-EXPIRE
     * @param cb
     */
     function(cb) {
        client.set(
            [expireMultiSetKey1, expireMultiSetKey2, expireMultiSetKey3],
            [expireMultiSetValue1, expireMultiSetValue2, expireMultiSetValue3],
            function(error, response) {

            // Set the expire times
            client.expire([expireMultiSetKey1, expireMultiSetKey2, expireMultiSetKey3], [1000, 2000, 3000], function(error, response) {
                assert.equal(error, null, "Multi-EXPIRE returned an error: " + error);
                assert.equal(response.length, 3, "Multi-EXPIRE returned the wrong number of values: " + response.length);
                assert.equal(response[0], true, "Multi-EXPIRE did not return true: " + response[0]);
                assert.equal(response[1], true, "Multi-EXPIRE did not return true: " + response[1]);
                assert.equal(response[2], true, "Multi-EXPIRE did not return true: " + response[2]);

                // Get the values before they expires
                client.get([expireMultiSetKey1, expireMultiSetKey2, expireMultiSetKey3], function(error, response) {
                    assert.equal(error, null, "GET after Multi-EXPIRE returned an error: " + error);
                    assert.equal(response.length, 3, "GET after Multi-EXPIRE returned the wrong number of values: " + response.length);
                    assert.equal(response[0], expireMultiSetValue1, "GET after Multi-EXPIRE did not return the right value: " + response[0]);
                    assert.equal(response[1], expireMultiSetValue2, "GET after Multi-EXPIRE did not return the right value: " + response[1]);
                    assert.equal(response[2], expireMultiSetValue3, "GET after Multi-EXPIRE did not return the right value: " + response[2]);

                    // Check the first two keys expired
                    setTimeout(function() {
                        client.get([expireMultiSetKey1, expireMultiSetKey2, expireMultiSetKey3], function(error, response) {
                            assert.equal(error, null, "GET after Multi-EXPIRE Complete(2) returned an error: " + error);
                            assert.equal(response.length, 3, "GET after Multi-EXPIRE Complete(2) returned the wrong number of values: " + response.length);
                            assert.equal(response[0], null, "GET after Multi-EXPIRE Complete(2) did not return null: " + response[0]);
                            assert.equal(response[1], null, "GET after Multi-EXPIRE Complete(2) did not return null: " + response[1]);
                            assert.equal(response[2], expireMultiSetValue3, "GET after Multi-EXPIRE Complete(2) returned null for non-expired key: " + response[2]);

                            // Check all keys expired
                            setTimeout(function() {
                                client.get([expireMultiSetKey1, expireMultiSetKey2, expireMultiSetKey3], function(error, response) {
                                    assert.equal(error, null, "GET after Multi-EXPIRE Complete returned an error: " + error);
                                    assert.equal(response.length, 3, "GET after Multi-EXPIRE Complete returned the wrong number of values: " + response.length);
                                    assert.equal(response[0], null, "GET after Multi-EXPIRE Complete did not return null: " + response[0]);
                                    assert.equal(response[1], null, "GET after Multi-EXPIRE Complete did not return null: " + response[1]);
                                    assert.equal(response[2], null, "GET after Multi-EXPIRE Complete did not return null: " + response[2]);

                                    console.log("Multi-EXPIRE: OK");
                                    cb(null, true);
                                });

                            }, 1001);
                        });
                    }, 2001);

                });
            });

        });
     },

    /**
     * Tests RANDOM
     * @param cb
     */
     function(cb) {
         // First, get a list of keys in the cache
         client.keys(function(error, keys) {

             // Get a random key and ensure it exists in the keys array
             client.random(function(error, response) {
                 assert.equal(error, null, "RANDOM returned an error: " + error);
                 assert.equal(response.length, 1, "RANDOM returned the wrong number of values: " + response.length);
                 assert.notEqual(keys.indexOf(response[0]), -1, "RANDOM returned a key that doesn't exist: [" + keys + "]  " + response[0]);

                 console.log("KEYS: OK");
                 cb(null, true);
             });
         });

     }

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