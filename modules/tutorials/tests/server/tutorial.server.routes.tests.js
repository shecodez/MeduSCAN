'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Tutorial = mongoose.model('Tutorial'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, tutorial;

/**
 * Tutorial routes tests
 */
describe('Tutorial CRUD tests', function () {

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

    // Save a user to the test db and create new Tutorial
    user.save(function () {
      tutorial = {
        name: 'Tutorial name'
      };

      done();
    });
  });

  it('should be able to save a Tutorial if logged in', function (done) {
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

        // Save a new Tutorial
        agent.post('/api/tutorials')
          .send(tutorial)
          .expect(200)
          .end(function (tutorialSaveErr, tutorialSaveRes) {
            // Handle Tutorial save error
            if (tutorialSaveErr) {
              return done(tutorialSaveErr);
            }

            // Get a list of Tutorials
            agent.get('/api/tutorials')
              .end(function (tutorialsGetErr, tutorialsGetRes) {
                // Handle Tutorial save error
                if (tutorialsGetErr) {
                  return done(tutorialsGetErr);
                }

                // Get Tutorials list
                var tutorials = tutorialsGetRes.body;

                // Set assertions
                (tutorials[0].user._id).should.equal(userId);
                (tutorials[0].name).should.match('Tutorial name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Tutorial if not logged in', function (done) {
    agent.post('/api/tutorials')
      .send(tutorial)
      .expect(403)
      .end(function (tutorialSaveErr, tutorialSaveRes) {
        // Call the assertion callback
        done(tutorialSaveErr);
      });
  });

  it('should not be able to save an Tutorial if no name is provided', function (done) {
    // Invalidate name field
    tutorial.name = '';

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

        // Save a new Tutorial
        agent.post('/api/tutorials')
          .send(tutorial)
          .expect(400)
          .end(function (tutorialSaveErr, tutorialSaveRes) {
            // Set message assertion
            (tutorialSaveRes.body.message).should.match('Please fill Tutorial name');

            // Handle Tutorial save error
            done(tutorialSaveErr);
          });
      });
  });

  it('should be able to update an Tutorial if signed in', function (done) {
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

        // Save a new Tutorial
        agent.post('/api/tutorials')
          .send(tutorial)
          .expect(200)
          .end(function (tutorialSaveErr, tutorialSaveRes) {
            // Handle Tutorial save error
            if (tutorialSaveErr) {
              return done(tutorialSaveErr);
            }

            // Update Tutorial name
            tutorial.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Tutorial
            agent.put('/api/tutorials/' + tutorialSaveRes.body._id)
              .send(tutorial)
              .expect(200)
              .end(function (tutorialUpdateErr, tutorialUpdateRes) {
                // Handle Tutorial update error
                if (tutorialUpdateErr) {
                  return done(tutorialUpdateErr);
                }

                // Set assertions
                (tutorialUpdateRes.body._id).should.equal(tutorialSaveRes.body._id);
                (tutorialUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Tutorials if not signed in', function (done) {
    // Create new Tutorial model instance
    var tutorialObj = new Tutorial(tutorial);

    // Save the tutorial
    tutorialObj.save(function () {
      // Request Tutorials
      request(app).get('/api/tutorials')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Tutorial if not signed in', function (done) {
    // Create new Tutorial model instance
    var tutorialObj = new Tutorial(tutorial);

    // Save the Tutorial
    tutorialObj.save(function () {
      request(app).get('/api/tutorials/' + tutorialObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', tutorial.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Tutorial with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/tutorials/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Tutorial is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Tutorial which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Tutorial
    request(app).get('/api/tutorials/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Tutorial with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Tutorial if signed in', function (done) {
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

        // Save a new Tutorial
        agent.post('/api/tutorials')
          .send(tutorial)
          .expect(200)
          .end(function (tutorialSaveErr, tutorialSaveRes) {
            // Handle Tutorial save error
            if (tutorialSaveErr) {
              return done(tutorialSaveErr);
            }

            // Delete an existing Tutorial
            agent.delete('/api/tutorials/' + tutorialSaveRes.body._id)
              .send(tutorial)
              .expect(200)
              .end(function (tutorialDeleteErr, tutorialDeleteRes) {
                // Handle tutorial error error
                if (tutorialDeleteErr) {
                  return done(tutorialDeleteErr);
                }

                // Set assertions
                (tutorialDeleteRes.body._id).should.equal(tutorialSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Tutorial if not signed in', function (done) {
    // Set Tutorial user
    tutorial.user = user;

    // Create new Tutorial model instance
    var tutorialObj = new Tutorial(tutorial);

    // Save the Tutorial
    tutorialObj.save(function () {
      // Try deleting Tutorial
      request(app).delete('/api/tutorials/' + tutorialObj._id)
        .expect(403)
        .end(function (tutorialDeleteErr, tutorialDeleteRes) {
          // Set message assertion
          (tutorialDeleteRes.body.message).should.match('User is not authorized');

          // Handle Tutorial error error
          done(tutorialDeleteErr);
        });

    });
  });

  it('should be able to get a single Tutorial that has an orphaned user reference', function (done) {
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

          // Save a new Tutorial
          agent.post('/api/tutorials')
            .send(tutorial)
            .expect(200)
            .end(function (tutorialSaveErr, tutorialSaveRes) {
              // Handle Tutorial save error
              if (tutorialSaveErr) {
                return done(tutorialSaveErr);
              }

              // Set assertions on new Tutorial
              (tutorialSaveRes.body.name).should.equal(tutorial.name);
              should.exist(tutorialSaveRes.body.user);
              should.equal(tutorialSaveRes.body.user._id, orphanId);

              // force the Tutorial to have an orphaned user reference
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

                    // Get the Tutorial
                    agent.get('/api/tutorials/' + tutorialSaveRes.body._id)
                      .expect(200)
                      .end(function (tutorialInfoErr, tutorialInfoRes) {
                        // Handle Tutorial error
                        if (tutorialInfoErr) {
                          return done(tutorialInfoErr);
                        }

                        // Set assertions
                        (tutorialInfoRes.body._id).should.equal(tutorialSaveRes.body._id);
                        (tutorialInfoRes.body.name).should.equal(tutorial.name);
                        should.equal(tutorialInfoRes.body.user, undefined);

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
      Tutorial.remove().exec(done);
    });
  });
});
