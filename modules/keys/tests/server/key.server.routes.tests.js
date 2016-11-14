'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Key = mongoose.model('Key'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, key;

/**
 * Key routes tests
 */
describe('Key CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Key
    user.save(function () {
      key = {
        name: 'Key name'
      };

      done();
    });
  });

  it('should be able to save a Key if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Key
        agent.post('/api/keys')
          .send(key)
          .expect(200)
          .end(function (keySaveErr, keySaveRes) {
            // Handle Key save error
            if (keySaveErr) {
              return done(keySaveErr);
            }

            // Get a list of Keys
            agent.get('/api/keys')
              .end(function (keysGetErr, keysGetRes) {
                // Handle Key save error
                if (keysGetErr) {
                  return done(keysGetErr);
                }

                // Get Keys list
                var keys = keysGetRes.body;

                // Set assertions
                (keys[0].user._id).should.equal(userId);
                (keys[0].name).should.match('Key name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Key if not logged in', function (done) {
    agent.post('/api/keys')
      .send(key)
      .expect(403)
      .end(function (keySaveErr, keySaveRes) {
        // Call the assertion callback
        done(keySaveErr);
      });
  });

  it('should not be able to save an Key if no name is provided', function (done) {
    // Invalidate name field
    key.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Key
        agent.post('/api/keys')
          .send(key)
          .expect(400)
          .end(function (keySaveErr, keySaveRes) {
            // Set message assertion
            (keySaveRes.body.message).should.match('Please fill Key name');

            // Handle Key save error
            done(keySaveErr);
          });
      });
  });

  it('should be able to update an Key if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Key
        agent.post('/api/keys')
          .send(key)
          .expect(200)
          .end(function (keySaveErr, keySaveRes) {
            // Handle Key save error
            if (keySaveErr) {
              return done(keySaveErr);
            }

            // Update Key name
            key.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Key
            agent.put('/api/keys/' + keySaveRes.body._id)
              .send(key)
              .expect(200)
              .end(function (keyUpdateErr, keyUpdateRes) {
                // Handle Key update error
                if (keyUpdateErr) {
                  return done(keyUpdateErr);
                }

                // Set assertions
                (keyUpdateRes.body._id).should.equal(keySaveRes.body._id);
                (keyUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Keys if not signed in', function (done) {
    // Create new Key model instance
    var keyObj = new Key(key);

    // Save the key
    keyObj.save(function () {
      // Request Keys
      request(app).get('/api/keys')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Key if not signed in', function (done) {
    // Create new Key model instance
    var keyObj = new Key(key);

    // Save the Key
    keyObj.save(function () {
      request(app).get('/api/keys/' + keyObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', key.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Key with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/keys/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Key is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Key which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Key
    request(app).get('/api/keys/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Key with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Key if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Key
        agent.post('/api/keys')
          .send(key)
          .expect(200)
          .end(function (keySaveErr, keySaveRes) {
            // Handle Key save error
            if (keySaveErr) {
              return done(keySaveErr);
            }

            // Delete an existing Key
            agent.delete('/api/keys/' + keySaveRes.body._id)
              .send(key)
              .expect(200)
              .end(function (keyDeleteErr, keyDeleteRes) {
                // Handle key error error
                if (keyDeleteErr) {
                  return done(keyDeleteErr);
                }

                // Set assertions
                (keyDeleteRes.body._id).should.equal(keySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Key if not signed in', function (done) {
    // Set Key user
    key.user = user;

    // Create new Key model instance
    var keyObj = new Key(key);

    // Save the Key
    keyObj.save(function () {
      // Try deleting Key
      request(app).delete('/api/keys/' + keyObj._id)
        .expect(403)
        .end(function (keyDeleteErr, keyDeleteRes) {
          // Set message assertion
          (keyDeleteRes.body.message).should.match('User is not authorized');

          // Handle Key error error
          done(keyDeleteErr);
        });

    });
  });

  it('should be able to get a single Key that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Key
          agent.post('/api/keys')
            .send(key)
            .expect(200)
            .end(function (keySaveErr, keySaveRes) {
              // Handle Key save error
              if (keySaveErr) {
                return done(keySaveErr);
              }

              // Set assertions on new Key
              (keySaveRes.body.name).should.equal(key.name);
              should.exist(keySaveRes.body.user);
              should.equal(keySaveRes.body.user._id, orphanId);

              // force the Key to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Key
                    agent.get('/api/keys/' + keySaveRes.body._id)
                      .expect(200)
                      .end(function (keyInfoErr, keyInfoRes) {
                        // Handle Key error
                        if (keyInfoErr) {
                          return done(keyInfoErr);
                        }

                        // Set assertions
                        (keyInfoRes.body._id).should.equal(keySaveRes.body._id);
                        (keyInfoRes.body.name).should.equal(key.name);
                        should.equal(keyInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Key.remove().exec(done);
    });
  });
});
