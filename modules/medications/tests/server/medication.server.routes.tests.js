'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Medication = mongoose.model('Medication'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, medication;

/**
 * Medication routes tests
 */
describe('Medication CRUD tests', function () {

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

    // Save a user to the test db and create new Medication
    user.save(function () {
      medication = {
        name: 'Medication name'
      };

      done();
    });
  });

  it('should be able to save a Medication if logged in', function (done) {
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

        // Save a new Medication
        agent.post('/api/medications')
          .send(medication)
          .expect(200)
          .end(function (medicationSaveErr, medicationSaveRes) {
            // Handle Medication save error
            if (medicationSaveErr) {
              return done(medicationSaveErr);
            }

            // Get a list of Medications
            agent.get('/api/medications')
              .end(function (medicationsGetErr, medicationsGetRes) {
                // Handle Medication save error
                if (medicationsGetErr) {
                  return done(medicationsGetErr);
                }

                // Get Medications list
                var medications = medicationsGetRes.body;

                // Set assertions
                (medications[0].user._id).should.equal(userId);
                (medications[0].name).should.match('Medication name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Medication if not logged in', function (done) {
    agent.post('/api/medications')
      .send(medication)
      .expect(403)
      .end(function (medicationSaveErr, medicationSaveRes) {
        // Call the assertion callback
        done(medicationSaveErr);
      });
  });

  it('should not be able to save an Medication if no name is provided', function (done) {
    // Invalidate name field
    medication.name = '';

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

        // Save a new Medication
        agent.post('/api/medications')
          .send(medication)
          .expect(400)
          .end(function (medicationSaveErr, medicationSaveRes) {
            // Set message assertion
            (medicationSaveRes.body.message).should.match('Please fill Medication name');

            // Handle Medication save error
            done(medicationSaveErr);
          });
      });
  });

  it('should be able to update an Medication if signed in', function (done) {
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

        // Save a new Medication
        agent.post('/api/medications')
          .send(medication)
          .expect(200)
          .end(function (medicationSaveErr, medicationSaveRes) {
            // Handle Medication save error
            if (medicationSaveErr) {
              return done(medicationSaveErr);
            }

            // Update Medication name
            medication.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Medication
            agent.put('/api/medications/' + medicationSaveRes.body._id)
              .send(medication)
              .expect(200)
              .end(function (medicationUpdateErr, medicationUpdateRes) {
                // Handle Medication update error
                if (medicationUpdateErr) {
                  return done(medicationUpdateErr);
                }

                // Set assertions
                (medicationUpdateRes.body._id).should.equal(medicationSaveRes.body._id);
                (medicationUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Medications if not signed in', function (done) {
    // Create new Medication model instance
    var medicationObj = new Medication(medication);

    // Save the medication
    medicationObj.save(function () {
      // Request Medications
      request(app).get('/api/medications')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Medication if not signed in', function (done) {
    // Create new Medication model instance
    var medicationObj = new Medication(medication);

    // Save the Medication
    medicationObj.save(function () {
      request(app).get('/api/medications/' + medicationObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', medication.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Medication with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/medications/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Medication is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Medication which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Medication
    request(app).get('/api/medications/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Medication with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Medication if signed in', function (done) {
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

        // Save a new Medication
        agent.post('/api/medications')
          .send(medication)
          .expect(200)
          .end(function (medicationSaveErr, medicationSaveRes) {
            // Handle Medication save error
            if (medicationSaveErr) {
              return done(medicationSaveErr);
            }

            // Delete an existing Medication
            agent.delete('/api/medications/' + medicationSaveRes.body._id)
              .send(medication)
              .expect(200)
              .end(function (medicationDeleteErr, medicationDeleteRes) {
                // Handle medication error error
                if (medicationDeleteErr) {
                  return done(medicationDeleteErr);
                }

                // Set assertions
                (medicationDeleteRes.body._id).should.equal(medicationSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Medication if not signed in', function (done) {
    // Set Medication user
    medication.user = user;

    // Create new Medication model instance
    var medicationObj = new Medication(medication);

    // Save the Medication
    medicationObj.save(function () {
      // Try deleting Medication
      request(app).delete('/api/medications/' + medicationObj._id)
        .expect(403)
        .end(function (medicationDeleteErr, medicationDeleteRes) {
          // Set message assertion
          (medicationDeleteRes.body.message).should.match('User is not authorized');

          // Handle Medication error error
          done(medicationDeleteErr);
        });

    });
  });

  it('should be able to get a single Medication that has an orphaned user reference', function (done) {
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

          // Save a new Medication
          agent.post('/api/medications')
            .send(medication)
            .expect(200)
            .end(function (medicationSaveErr, medicationSaveRes) {
              // Handle Medication save error
              if (medicationSaveErr) {
                return done(medicationSaveErr);
              }

              // Set assertions on new Medication
              (medicationSaveRes.body.name).should.equal(medication.name);
              should.exist(medicationSaveRes.body.user);
              should.equal(medicationSaveRes.body.user._id, orphanId);

              // force the Medication to have an orphaned user reference
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

                    // Get the Medication
                    agent.get('/api/medications/' + medicationSaveRes.body._id)
                      .expect(200)
                      .end(function (medicationInfoErr, medicationInfoRes) {
                        // Handle Medication error
                        if (medicationInfoErr) {
                          return done(medicationInfoErr);
                        }

                        // Set assertions
                        (medicationInfoRes.body._id).should.equal(medicationSaveRes.body._id);
                        (medicationInfoRes.body.name).should.equal(medication.name);
                        should.equal(medicationInfoRes.body.user, undefined);

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
      Medication.remove().exec(done);
    });
  });
});
