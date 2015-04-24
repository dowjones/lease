var generateErrorClass = require('common-errors').helpers.generateClass,
  AlreadyLeasedError = generateErrorClass('AlreadyLeasedError'),
  LeaseCriticalSectionError = generateErrorClass('LeaseCriticalSectionError');

module.exports = createLease;

/**
 * Create a new lease acquirer
 *
 * @param {Number} ttlInMs
 */

function createLease(ttlInMs) {
  var leasedKeys = {};

  ttlInMs = ttlInMs || 1000;

  return function acquire(key, criticalFn) {
    var timeoutId;

    function release() {
      delete leasedKeys[key];
      clearTimeout(timeoutId);
    }

    // err if already acquired
    if (leasedKeys[key]) return criticalFn(
      new AlreadyLeasedError('key:' + key));

    // ensure no other can be acquired with same key
    leasedKeys[key] = true;

    // start the lease timer
    timeoutId = setTimeout(release, ttlInMs);

    // ensure the critical section is async
    process.nextTick(function () {
      try {
        criticalFn(null, release);
      } catch (e) {
        release();
        criticalFn(new LeaseCriticalSectionError('key:' + key, e));
      }
    });
  };
}
