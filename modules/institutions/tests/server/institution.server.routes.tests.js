'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Institution = mongoose.model('Institution'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, institution;

/**
 * Institution routes tests
 */
describe('Institution CRUD tests', function () {

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

    // Save a user to the test db and create new Institution
    user.save(function () {
      institution = {
        name: 'Institution name'
      };

      done();
    });
  });

  it('should be able to save a Institution if logged in', function (done) {
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

        // Save a new Institution
        agent.post('/api/institutions')
          .send(institution)
          .expect(200)
          .end(function (institutionSaveErr, institutionSaveRes) {
            // Handle Institution save error
            if (institutionSaveErr) {
              return done(institutionSaveErr);
            }

            // Get a list of Institutions
            agent.get('/api/institutions')
              .end(function (institutionsGetErr, institutionsGetRes) {
                // Handle Institution save error
                if (institutionsGetErr) {
                  return done(institutionsGetErr);
                }

                // Get Institutions list
                var institutions = institutionsGetRes.body;

                // Set assertions
                (institutions[0].user._id).should.equal(userId);
                (institutions[0].name).should.match('Institution name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Institution if not logged in', function (done) {
    agent.post('/api/institutions')
      .send(institution)
      .expect(403)
      .end(function (institutionSaveErr, institutionSaveRes) {
        // Call the assertion callback
        done(institutionSaveErr);
      });
  });

  it('should not be able to save an Institution if no name is provided', function (done) {
    // Invalidate name field
    institution.name = '';

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

        // Save a new Institution
        agent.post('/api/institutions')
          .send(institution)
          .expect(400)
          .end(function (institutionSaveErr, institutionSaveRes) {
            // Set message assertion
            (institutionSaveRes.body.message).should.match('Please fill Institution name');

            // Handle Institution save error
            done(institutionSaveErr);
          });
      });
  });

  it('should be able to update an Institution if signed in', function (done) {
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

        // Save a new Institution
        agent.post('/api/institutions')
          .send(institution)
          .expect(200)
          .end(function (institutionSaveErr, institutionSaveRes) {
            // Handle Institution save error
            if (institutionSaveErr) {
              return done(institutionSaveErr);
            }

            // Update Institution name
            institution.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Institution
            agent.put('/api/institutions/' + institutionSaveRes.body._id)
              .send(institution)
              .expect(200)
              .end(function (institutionUpdateErr, institutionUpdateRes) {
                // Handle Institution update error
                if (institutionUpdateErr) {
                  return done(institutionUpdateErr);
                }

                // Set assertions
                (institutionUpdateRes.body._id).should.equal(institutionSaveRes.body._id);
                (institutionUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Institutions if not signed in', function (done) {
    // Create new Institution model instance
    var institutionObj = new Institution(institution);

    // Save the institution
    institutionObj.save(function () {
      // Request Institutions
      request(app).get('/api/institutions')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Institution if not signed in', function (done) {
    // Create new Institution model instance
    var institutionObj = new Institution(institution);

    // Save the Institution
    institutionObj.save(function () {
      request(app).get('/api/institutions/' + institutionObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', institution.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Institution with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/institutions/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Institution is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Institution which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Institution
    request(app).get('/api/institutions/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Institution with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Institution if signed in', function (done) {
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

        // Save a new Institution
        agent.post('/api/institutions')
          .send(institution)
          .expect(200)
          .end(function (institutionSaveErr, institutionSaveRes) {
            // Handle Institution save error
            if (institutionSaveErr) {
              return done(institutionSaveErr);
            }

            // Delete an existing Institution
            agent.delete('/api/institutions/' + institutionSaveRes.body._id)
              .send(institution)
              .expect(200)
              .end(function (institutionDeleteErr, institutionDeleteRes) {
                // Handle institution error error
                if (institutionDeleteErr) {
                  return done(institutionDeleteErr);
                }

                // Set assertions
                (institutionDeleteRes.body._id).should.equal(institutionSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Institution if not signed in', function (done) {
    // Set Institution user
    institution.user = user;

    // Create new Institution model instance
    var institutionObj = new Institution(institution);

    // Save the Institution
    institutionObj.save(function () {
      // Try deleting Institution
      request(app).delete('/api/institutions/' + institutionObj._id)
        .expect(403)
        .end(function (institutionDeleteErr, institutionDeleteRes) {
          // Set message assertion
          (institutionDeleteRes.body.message).should.match('User is not authorized');

          // Handle Institution error error
          done(institutionDeleteErr);
        });

    });
  });

  it('should be able to get a single Institution that has an orphaned user reference', function (done) {
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

          // Save a new Institution
          agent.post('/api/institutions')
            .send(institution)
            .expect(200)
            .end(function (institutionSaveErr, institutionSaveRes) {
              // Handle Institution save error
              if (institutionSaveErr) {
                return done(institutionSaveErr);
              }

              // Set assertions on new Institution
              (institutionSaveRes.body.name).should.equal(institution.name);
              should.exist(institutionSaveRes.body.user);
              should.equal(institutionSaveRes.body.user._id, orphanId);

              // force the Institution to have an orphaned user reference
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

                    // Get the Institution
                    agent.get('/api/institutions/' + institutionSaveRes.body._id)
                      .expect(200)
                      .end(function (institutionInfoErr, institutionInfoRes) {
                        // Handle Institution error
                        if (institutionInfoErr) {
                          return done(institutionInfoErr);
                        }

                        // Set assertions
                        (institutionInfoRes.body._id).should.equal(institutionSaveRes.body._id);
                        (institutionInfoRes.body.name).should.equal(institution.name);
                        should.equal(institutionInfoRes.body.user, undefined);

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
      Institution.remove().exec(done);
    });
  });
});
