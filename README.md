RESTCache
=========

RESTCache is single-threaded, first come first serve, in-memory cache allowing fully atomic operations through an HTTP(s) interface. It's built on top of Node.js, and can be used as part of your existing application, or run on a standalone server.

# Features

#### HTTP(s) Interface

All of the commands available to the cache are exposed via an HTTP(s) interface, allowing you to easily integrate RESTCache with applications running on any language, framework, or platform.

The RESTCache server accepts both GET and POST requests.

#### Extensions

RESTCache supports user extensions, allow you to create your own custom HTTP(s) commands, and to manipulate the cache however you see fit.

Of course, if your extension would be of use to others, feel free to create a Pull Request, and it could be brought into the core RESTCache project!

For more on extensions, see [Building Extensions] (#buildingExtensions).

#### Automated and REST Based Cache Backups/Restoration

RESTCache supports automated (time interval) disk backups, and restoring from the most recent backup at startup. In addition, the [BACKUP] (#backup) and [RESTORE] (#restore) commands are available through the HTTP(s) interface and client library.

For more on cache backups/restoration, see [Backing Up and Restoring From Disk] (#backup).

#### Eager Key Expiration

RESTCache eagerly removes expired keys, meaning that if you set a key to expire after 10 seconds, the key and value will be removed from memory in 10 seconds. RESTCache doesn't wait until the next call to get that key before freeing the memory that it occupies.

By default, keys (and their values) live forever. In order to release keys, there are a few options:

- Set the Default Expiry: In the [Cache Configuration] (#config), there is a configuration to set a default expire time for all keys.
- Call [EXPIRE] (#expire): Set a time to expire the passed key(s)
- Call [DEL] (#del): Instantly delete the key and it's value

#### Batch Commands

The majority of commands, unless otherwise indicated, have a 'Batch' mode which allows either a single key and/or value to be passed, or an Array of keys and/or values in order to batch requests.

#### JSON Responses

All commands return valid JSON responses, with two root elements: *errors* and *response*

- **errors** contains an Array of *RCError* objects, or an empty Array in the case of no errors.
    *RCError* objects contain a message (string) and an index (integer) that the error occurred at. For example, if you call an action with 5 keys and the cache failed to perform the action on the third key, the index would be 2.
- **response** contains an Array of values specific to the particular command being executed.
    The *response* value is always an Array, even if the command returns only one response.

If you are using the Node.js client library included with RESTCache, the callback will have the error and response values split for you, as seen in the [examples] (#examples) below.

#### Configurable Commands

All commands exposed through RESTCache can be enabled or disabled through simple true/false [Configuration] (#config) values. The majority of core commands are enabled by default, but some are disabled by default for security reasons. Each of the [Examples] (#examples) below indicates if a command is enabled or disabled by default.

#### Quick Links:

- [Getting Started] (#gettingStarted)
- [Examples] (#examples)
- [Building Extensions] (#buildingExtensions)
- [Backing Up and Restoring From Disk] (#backup)
- [Configuration] (#config)
- [Contributing] (#contrib)



# <a name='gettingStarted'></a>Getting Started

This repository contains the server component of RESTCache, a Node.js client, and a test script to validate proper setup.

#### Server

```bash
cd server
npm install # Required first time only
node server.js
```

#### Node.js Client

```node
var RCClient = require("./path/to/RCClient");

// Optional client configuration
var opts = {
    debug: false,
    mode: "POST"
};
var client = new RCClient("http://localhost:7654", opts);
```

#### Tests

```bash
cd test
npm install # Required first time only
node test.js -h=http://localhost:7654
```



# <a name="examples"></a>Examples

The following examples are demonstrated using the Node.js client, which is just a wrapper for the exposed HTTP(s) cache endpoints, as shown in the 'equiv' comments found throughout the examples.

#### PING

**Default Enabled:** *true*

The PING command verifies that you can connect to the RESTCache server.

```node
// equiv: /ping
client.ping(function(err, res) {
    console.log(res); // prints: ['PONG']
});

```

#### SET and GET

**Default Enabled:** *true*

Simple SET and GET functionality. SET a String KEY and GET it.

```node
// equiv: /set?key=value
client.set('key', 'value', function(err, res) {

    // equiv: /get?key
    client.get('key', function(err, res) {
        console.log(res); // prints: ['value']
    });
});
```

Using the same SET and GET commands, you can also SET and Array of values with corresponding keys, or GET an Array of values by passing an Array of keys.

```node
// equiv: /set?key1=value1&key2=value2
client.set(['key1', 'key2'], ['value1', 'value2'], function(err, res) {

    // equiv: /get?key1
    client.get('key1', function(err, res) {
        console.log(res); // prints: ['value1']
    });

    // equiv: get?key1&key2
    client.get(['key1', 'key2'], function(err, res) {
        console.log(res); // prints: ['value1', 'value2']
    });
});
```

#### DEL

**Default Enabled:** *true*

Delete a key/value by passing the key to the DEL command.

```node
// equiv: /del?key
client.del('key', function(err, res) {

    client.get('key', function(err, res) {
        console.log(res); // prints: [null]
    });
});
```

DEL also allows an Array of keys to be deleted.

```node
// equiv: /del?key1&key2
client.del(['key1', 'key2'], function(err, res) {

    client.get(['key1', 'key2'], function(err, res) {
        console.log(res); // prints: [null, null]
    });
});
```

#### KEYS

**Default Enabled:** *false*

Returns a list of all keys in the cache.

```node
client.set(['key1', 'key2'], ['value1', 'value2'], function(err, res) {

    // equiv: /keys
    client.keys(function(err, res) {
        console.log(res); // prints: ['key1', 'key2']
    });
});
```

#### INCR

**Default Enabled:** *true*

Increments a numeric value corresponding to the given key.
INCR takes an optional incrementBy value which can be used to increment by a value other than the default (1).

```node
client.set(['numKey1', 'numKey2'], [2, 4], function(err, res) {

    // equiv: /incr?numKey1
    client.incr('numKey1', null, function(err, res) {
        console.log(res); // prints: [3]
    });

    // equiv: /incr?numKey2=3
    client.incr('numKey2', 3, function(err, res) {
        console.log(res); // prints: [7]
    });
});
```

Calling INCR on a missing key will initialize the key with a value of 0, and then INCR as usual (to 1).

```node
client.incr('unknownKey', null, function(err, res) {
    console.log(res); // prints: [1]
});
```

INCR also allows you to pass multiple keys (and optional incrementBy values).

```node
client.set(['numKey1', 'numKey2'], [2, 4], function(err, res) {

    // equiv: /incr?numKey1&numKey2
    client.incr(['numKey1', 'numKey2'], null, function(err, res) {
        console.log(res); // prints: [3, 5]
    });
});
```

If you pass multiple keys to INCR, you must pass either the same number of incrementBy values, or null to default all of them to 1.

```node
client.set(['numKey1', 'numKey2'], [2, 4], function(err, res) {

    // equiv: /incr?numKey1=2&numKey2=4
    client.incr(['numKey1', 'numKey2'], [2, 4], function(err, res) {
        console.log(res); // prints: [4, 8]
    });
});
```

#### DECR

**Default Enabled:** *true*

Decrements a numeric value corresponding to the given key.
DECR takes an optional decrementBy value which can be used to decrement by a value other than the default (1).

```node
client.set(['numKey1', 'numKey2'], [2, 8], function(err, res) {

    // equiv: /decr?numKey1
    client.decr('numKey1', null, function(err, res) {
        console.log(res); // prints: [1]
    });

    // equiv: /decr?numKey2=5
    client.decr('numKey2', 5, function(err, res) {
        console.log(res); // prints: [3]
    });
});
```

Calling DECR on a missing key will initialize the key with a value of 0, and then DECR as usual (to -1).

```node
client.decr('unknownKey', null, function(err, res) {
    console.log(res); // prints: [-1]
});
```

DECR also allows you to pass multiple keys (and optional decrementBy values).

```node
client.set(['numKey1', 'numKey2'], [2, 4], function(err, res) {

    // equiv: /decr?numKey1&numKey2
    client.decr(['numKey1', 'numKey2'], null, function(err, res) {
        console.log(res); // prints: [1, 3]
    });
});
```

If you pass multiple keys to DECR, you must pass either the same number of decrementBy values, or null to default all of them to 1.

```node
client.set(['numKey1', 'numKey2'], [2, 4], function(err, res) {

    // equiv: /decr?numKey1=2&numKey2=4
    client.decr(['numKey1', 'numKey2'], [2, 4], function(err, res) {
        console.log(res); // prints: [0, 0]
    });
});
```

#### <a name="expire"></a>EXPIRE

**Default Enabled:** *true*

Sets the expiry time on a key, in milliseconds, from the time the command is received. If an existing EXPIRE time is set on the specified key, or a default expiry time has been set, it will be overwritten with the new EXPIRE time.

```node
client.set('keyToExpire', 'valueToExpire', function(err, res) {

    // equiv: /expire?keyToExpire=1000
    client.expire('keyToExpire', 1000, function(err, res) {
        console.log(res); // prints: [true]

        setTimeout(function() {
            client.get('keyToExpire', function(err, res) {
                console.log(res); // prints: [null]
            });
        }, 1001);
    });
});
```

You can also EXPIRE multiple keys in the same request. When passing multiple keys, you must pass the same number of expire times.

```node
client.set(['keyToExpire1', 'keyToExpire2'], ['valueToExpire1', 'valueToExpire2'], function(err, res) {

    // equiv: /expire?keyToExpire1=1000&keyToExpire2=2500
    client.expire(['keyToExpire1', 'keyToExpire2'], [1000, 2500], function(err, res) {
        console.log(res); // prints: [true, true]

        setTimeout(function() {
            client.get(['keyToExpire1', 'keyToExpire2'], function(err, res) {
                console.log(res); // prints: [null, 'valueToExpire2']
            });
        }, 1001);

        setTimeout(function() {
            client.get(['keyToExpire1', 'keyToExpire2'], function(err, res) {
                console.log(res); // prints: [null, null]
            });
        }, 2501);
    });
});
```

#### RANDOM

**Default Enabled:** *true*

Returns a RANDOM key from the cache, or NULL if the cache is empty.

```node
client.set(['key1', 'key2', 'key3'], [1, 2, 3], function(err, res) {

    // equiv: /random
    client.random(function(err, res) {
        console.log(res); // prints: one of 'key1', 'key2', or 'key3'
    });
});
```

#### STATS

**Default Enabled:** *false*

Returns RESTCache system stats such as memory usage, uptime, RESTCache and dependency version numbers, backup keys and timestamps, etc.

```node
// equiv: /stats
client.stats(function(err, res) {
    console.log(res); // prints: An Array containing a single JSON Object of system stats
});
```


#### BACKUP

**Default Enabled:** *false*

Performs a [disk backup] (#backup) and returns the key of the backup.

```node
// equiv: /backup
client.backup(function(err, res) {
    console.log(res); // prints: ['backup-name']
});
```

#### RESTORE

**Default Enabled:** *false*

Performs a [cache restore] (#backup) and returns true if the backup was successful, or an Error if the cache could not be restored. RESTORE takes exactly one parameter, which is the key to the backup you wish to restore from. Backup keys can be retrieved via the STATS (all backup keys) and BACKUP (the new backup key) commands.

```node
// equiv: /restore?backup-123.rc.bak
client.restore('backup-123.rc.bak', function(err, res) {
    console.log(res); // prints: [true]
});
```

#### DUMP

**Default Enabled:** *false*

Returns the entire cache as a JSON Object.

```node
client.set(['key1', 'key2'], ['value1', 'value2'], function(err, res) {

    // equiv: /dump
    client.dump(null, function(err, res) {
        console.log(res); // prints: [ {'key1': 'value1', 'key2': 'value2'} ]
    });
});
```

DUMP takes a single optional key which is the key to a specific backup if you wish to have RESTCache output the entire contents of a backup, rather than the current cache.

```node
// equiv: /dump?backup-123.rc.bak
client.dump('backup-123.rc.bak', function(err, res) {
    console.log(res); // prints: An Array containing a single JSON Object of the contents of the specified dump file
});
```


# <a name="buildingExtensions"></a> Building Extensions

Extensions allow you to implement or override functionality to RESTCache. Any JavaScript (.js) files placed in the server/extensions directory will be treated as additional routes, and can potentially override the built-in commands. It should be noted, extensions are subject to the ['command enabled/disabled configurations'] (#config), meaning if a command is disabled, calls to it through an extension will return an Error.

#### Examples

By creating and exporting a new instance of HttpRoute, we can define a path (i.e. the URL), and implement a callback to be executed when that path is hit. HttpRoute comes with a convenience method to generate consistent response formats across all routes and extensions, called *generateOutput*, which accepts an Array of *RCError* objects, and any value as a response, which will be converted into an Array (if not already an Array). See the HttpRoutes class for more detailed information on this method.

In the example below, when *<cache-host>/doAwesomeStuff* is hit, the callback will delete 'lameKey', and set 'awesomeKey' instead.

```node
var HttpRoute = require('../src/entity/HttpRoute');

module.exports = new HttpRoute('/doAwesomeStuff', function(cache, req, res) {
    // Do something awesome...

    cache.del('lameKey');
    cache.set('awesomeKey', 'Awesome Value');

    var output = this.generateOutput(null, cache.get('awesomeKey'));
    res.json(output);
});
```

While the previous example used existing cache functionality, you can also get deeper into the cache and provide new functionality, by accessing the internal cache.

In the following example, we retrieve all keys from the internal cache that contain the String 'awesome', output their existing values, and replace them with TRUE.

```node
var HttpRoute = require('../src/entity/HttpRoute');

module.exports = new HttpRoute('/getAwesome', function(cache, req, res) {
    // Access the internal cache, a JavaScript object
    var internalCache = cache.cache;

    var awesomeVals = [];
    for (var key in Object.keys(internalCache)) {
        if (key.indexOf("awesome") != -1) {
            awesomeVals.push(internalCache[key]);

            internalCache[key] = true;
        }
    }

    var output = this.generateOutput(null, awesomeVals);
    res.json(output);
});
```

In addition to implementing new functionality, you can also override the existing functions of RESTCache by providing an HttpRoute with the same path as an existing one.

For instance, if we wanted to add analytics to GET in order to determine what keys are getting the most requests:

```node
var HttpRoute = require('../src/entity/HttpRoute');

module.exports = new HttpRoute('/get', function(cache, req, res) {

    // Perform the standard GET
    var values = [];
    for (var key in req.query) {
        values.push(cache.get(key));

        // Add some analytics by calling INCR on another key, prefixed with accessCount:
        cache.incr('accessCount:' + key);
    }

    var output = this.generateOutput(null, values);
    res.json(output);
});
```

The most powerful use-case for custom Extensions is to batch together common sequences for your application's workflow into a single call. Since RESTCache is single-threaded, this provides a fully-atomic environment for accessing and manipulating your data, and you can be assured that no data has been modified between your calls to the cache.

In the following example, we can pass multiple key=value pairs to overwrite with a new value, only if the cached value is equal to the value we pass for each key.

```node
var HttpRoute = require('../src/entity/HttpRoute');

/**
 * Sample Request: /overwriteIfEquals?key1=value1&key2=value2&newValue=atomicallyAwesome
 *
 * In this example:
 *  - If 'key1' is equal to 'value1', replace it with 'atomicallyAwesome'
 *  - If 'key2' is equal to 'value2', replace it with 'atomicallyAwesome'
 */
module.exports = new HttpRoute('/overwriteIfEquals', function(cache, req, res) {
    var newValueKey = 'newValue';
    var newValue = req.keyPairs[newValueKey];

    var responses = [];
    for (var key in req.query) {
        if (key !== newValueKey && cache.get(key) === req.query[key]) {
            cache.set(key, newValue);
            responses.push(true);
        } else {
            responses.push(false);
        }
    }

    var output = this.generateOutput(null, responses);
    res.json(output);
});
```


#### Express.js and Added Middleware

RESTCache's HTTP(s) interface is built on top of [Express.js] (http://expressjs.com), which means the req/res objects passed to your callbacks are the same as the req/res objects used in Express.js routes.

For example, in the GET override extension above, we pulled all the keys out of the key=value pairs in the URL query-string (ie. /get?key=value) using *req.query*, which should seem familiar. We also used *res.json()* to output JSON responses in all of the extension examples above, but you could output HTML, or any format you desire.

You have full access to the req/res objects, and it is your responsibility to ensure a response is sent for each request.

For the sake of convenience, RESTCache implements an Express middleware that merges all parameters into a single object, available through *req.keyPairs* (seen the *overwriteIfEquals* example above). In order to handle duplicate keys across the different parameter sets, RESTCache prioritizes the parameters in the following order: *req.params > req.body > req.query*. This means if the key 'myKey' is duplicated across all three objects, *req.keyPairs['myKey']* will return the same value as *req.params['myKey']*. Of course you still have access to the three, unmodified parameter sets.


# <a name="backup"></a>Backing Up and Restoring From Disk

RESTCache comes with a built-in cache backup system, which can write the cache out to disk on a specified time interval, or via a REST/Client action.

RESTCache can also be configured to restore itself from the most recent backup upon startup. Because RESTCache stores the cache in JSON format, you can easily parse, modify, or create your own backups to restore from in order to pre-warm your cache.

In order to create your own backup to be restored at startup, simply provide a '.rc.bak' file in the configured backup directory (default *server/out*), and ensure that RESTCache is configured to enable restoring from backup. RESTCache will load the most recently modified backup at startup, and use it to pre-fill the cache.

For more on Backups and Restoring from disk, see [Configuration] (#config).



# <a name="config"></a>Configuration

RESTCache configuration is managed by a JSON file in *server/conf/config.js*. The configurations in this file are all commented to explain their usage, and are broken down into the following sections:

#### HTTP

Configurations related to the HTTP(s) interface, such as port.

#### Cache

Configurations specific to the cache, such as default expire time.

#### Commands

Configurations to enable/disable any commands available in RESTCache.

#### Backup

Configurations related to RESTCache backup and restoration, such as time interval to perform backups.

#### Extensions

Configurations related to extensions, such as where to load extensions from, and whether or not extensions are enabled.

#### Miscellaneous

Miscellaneous configurations, such as debug mode.



# <a name="contrib"></a>Contributing

Contributions are welcome!

Whether it's submitting an extension to become an official RESTCache action, or completing one of the [issues] (https://github.com/KyleBanks/RESTCache/issues) from the issue tracker, Pull Requests are very much appreciated.

If you find issues with RESTCache, or are interested in features/changes, please create a [new issue] (https://github.com/KyleBanks/RESTCache/issues/new) in order to discuss implementation.
