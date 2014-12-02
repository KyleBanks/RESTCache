RESTCache
=========

# What is it?

RESTCache is single-threaded, first come first serve, in-memory cache allowing fully atomic operations, with a REST style interface.

This repository contains the server component of RESTCache, a Node.js client, and a test script to validate proper setup.

# Example

### Run the Server

```node
cd server
node rc.js
```

### Connect via Node.js Client
```node
var RESTCache = require("restcache-client");
var client = new RESTCache("http://localhost:7654");
```

### SET and GET
```node
//equiv: /set?key=value
client.set('key', 'value', function(err, res) {
    
    //equiv: /get?key
    client.get('key', function(err, res) {
        console.log(res[0]); // prints: value
    });
});
```

### Multi-SET and Multi-GET
```node
//equiv: /set?key1=value1&key2=value2
client.set(['key1', 'key2'], ['value1', 'value2'], function(err, res) {
    
    //equiv: /get?key1
    client.get('key1', function(err, res) {
        console.log(res[0]); // prints: value1
    });
    
    //equiv: gey?key1&key2
    client.get(['key1', 'key2'], function(err, res) {
        console.log(res); // prints: value1, value2
    });
});
```
