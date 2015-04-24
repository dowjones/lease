# Lease [![Build Status](https://secure.travis-ci.org/areusjs/lease.png)](http://travis-ci.org/areusjs/lease) [![NPM version](https://badge.fury.io/js/lease.svg)](http://badge.fury.io/js/lease)

A memory (RAM) time-released lock for asynchronous resources.


## Usage

The following will drop all requests that come in while
the lock has been taken out and not yet released.

```js
var Lease = require('./'),
  lease = Lease(2000);

function get(cb) {
  function criticalSection(err, release) {
    if (err) {
      if ('AlreadyLeasedError' === err.name) return;
      return cb(err);
    }

    setTimeout(function () {
      release();
      cb(null, Math.random());
    }, 1000);
  }

  lease('key', criticalSection);
}
```

It is up to the client to choose what to do
when another resource acquired the lease.


### API

  - `Lease(timeInMs)`


## License

[MIT](/LICENSE)

