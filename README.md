RESTCache
=========

# What's RESTCache?

RESTCache is single-threaded, first come first serve, in-memory cache allowing fully atomic operations through an HTTP(s) interface. It's built on top of Node.js, and can be used as part of your existing application, or run on a standalone server.

## 'Multi' Commands

The majority of commands, unless otherwise indicated, have a 'Multi' mode which allows either a single key and/or value to be passed, or an Array of keys and/or values in order to batch requests.

In addition, all commands return JSON arrays, regardless of the number of keys and/or values passed. For instance, a GET request on a single key will return an Array of length 1.

## Extensions

RESTCache supports user extensions, allow you to create your own custom HTTP(s) actions, and to manipulate the cache however you see fit.

For more on extensions, see [Building Extensions](#buildingExtensions)

# Getting Started

This repository contains the server component of RESTCache, a Node.js client, and a test script to validate proper setup.

## Server

```node
cd server
node server.js
```

## Node.js Client

```node
var RESTCache = require("restcache-client");
var client = new RESTCache("http://localhost:7654");
```

## Tests

```node
cd test
node test.js
```

# Examples

The following examples are demonstrated using the Node.js client, which is just a wrapper for the exposed HTTP(s) cache endpoints, as shown in the 'equiv' comments found throughout the examples.

### PING

The PING command verifies that you can connect to the RESTCache server.

```node
// equiv: /ping
client.ping(function(err, res) {
    console.log(res); // prints: ['PONG']
});

```

### SET and GET

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

### Multi-SET and Multi-GET

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

### DEL

Delete a key/value by passing the key to the DEL command.

```node
// equiv: /del?key
client.del('key', function(err, res) {

    client.get('key', function(err, res) {
        console.log(res); // prints: [null]
    });
});
```

### Multi-DEL

Delete an array of keys/values by passing an Array of keys.

```node
// equiv: /del?key1&key2
client.del(['key1', 'key2'], function(err, res) {

    client.get(['key1', 'key2'], function(err, res) {
        console.log(res); // prints: [null, null]
    });
});
```

### KEYS

Returns a list of all keys in the cache.

```node
client.set(['key1', 'key2'], ['value1', 'value2'], function(err, res) {

    // equiv: /keys
    client.keys(function(err, res) {
        console.log(res); // prints: ['key1', 'key2']
    });
});
```

### INCR

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

### Multi-INCR

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

### DECR

Decrements a numeric value corresponding to the given key.
DECR takes an optional decrementBy value which can be used to decrement by a value other than the default (1).

```node
client.set(['numKey1', 'numKey2'], [2, 4], function(err, res) {

    // equiv: /decr?numKey1
    client.decr('numKey1', null, function(err, res) {
        console.log(res); // prints: [1]
    });

    // equiv: /decr?numKey2=3
    client.decr('numKey2', 3, function(err, res) {
        console.log(res); // prints: [1]
    });
});
```

Calling DECR on a missing key will initialize the key with a value of 0, and then DECR as usual (to -1).

```node
client.incr('unknownKey', null, function(err, res) {
    console.log(res); // prints: [1]
});
```

### Multi-DECR

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


### EXPIRE

Sets the expiry time on a key, in milliseconds, from the time the command is received. If an existing EXPIRE time is set on the specified key, it will be overwritten with the new EXPIRE time.

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

### Multi-EXPIRE

Sets the expiry time on multiple keys, in milliseconds, from the time the command is received. When passing multiple keys, you must pass the same number of expire times.

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


### RANDOM

Returns a RANDOM key from the cache, or NULL if the cache is empty.

```node
client.set(['key1', 'key2', 'key3'], [1, 2, 3], function(err, res) {

    // equiv: /random
    client.random(function(err, res) {
        console.log(res); // prints: one of 'key1', 'key2', or 'key3'
    });
});
```


# <a name="buildingExtensions"></a> Building Extensions