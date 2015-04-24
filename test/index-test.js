var createLease = require('../lib'),
  stub = require('sinon').stub,
  should = require('should');

describe('Lease', function () {
  it('should catch an error in critical section', function (done) {
    var lease = createLease(3);
    lease('k', function (err, release) {
      if (err) {
        err.name.should.equal('LeaseCriticalSectionError');
        return done();
      }
      throw new Error('bad');
    });
  });

  it('should prevent two lease aquires at once', function (done) {
    var lease = createLease(),
      alreadyLeased = stub();

    lease('k', function (err, release) {
      if (err) return done(err);

      alreadyLeased.calledOnce.should.be.ok;
      alreadyLeased.firstCall.args[0].name.should.equal('AlreadyLeasedError');

      release();
      lease('k', done);
    });

    lease('k', alreadyLeased);
  });

  it('should release lock after 3 even if release() was not called', function (done) {
    // I. set the lease timeout to 3ms
    var lease = createLease(3),
      first = false,
      second = false;

    // II. acquire a lease, but don't ever release (simulate process dying)
    lease('k', function (err, release) {
      first = true;
    });

    // III. attempt to acquire another lease right away
    // this should fail because of the previous lease
    lease('k', function (err) {
      err.name.should.equal('AlreadyLeasedError');
      second = true;
    });

    // IV. now, after 6ms (which is 3ms more than the timeout) we
    // try to acquire another lease. This should succeed, because
    // the timeout should automatically have cleared the lease
    setTimeout(function () {
      lease('k', function (err, release) {
        if (err) return done(err);

        first.should.be.ok;
        second.should.be.ok;
        release();

        done();
      });
    }, 6);
  });

  it('should clear timeout if set and released in time', function (done) {
    var lease = createLease(6);
    lease('k', function (err, release) {
      if (err) return done(err);
      setTimeout(release, 3);
      setTimeout(done, 9);
    });
  });
});

