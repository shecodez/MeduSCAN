'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Patient = mongoose.model('Patient'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, patient;

/**
 * Patient routes tests
 */
describe('Patient CRUD tests', function () {

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

    // Save a user to the test db and create new Patient
    user.save(function () {
      patient = {
        name: 'Patient name'
      };

      done();
    });
  });

  it('should be able to save a Patient if logged in', function (done) {
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

        // Save a new Patient
        agent.post('/api/patients')
          .send(patient)
          .expect(200)
          .end(function (patientSaveErr, patientSaveRes) {
            // Handle Patient save error
            if (patientSaveErr) {
              return done(patientSaveErr);
            }

            // Get a list of Patients
            agent.get('/api/patients')
              .end(function (patientsGetErr, patientsGetRes) {
                // Handle Patient save error
                if (patientsGetErr) {
                  return done(patientsGetErr);
                }

                // Get Patients list
                var patients = patientsGetRes.body;

                // Set assertions
                (patients[0].user._id).should.equal(userId);
                (patients[0].name).should.match('Patient name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Patient if not logged in', function (done) {
    agent.post('/api/patients')
      .send(patient)
      .expect(403)
      .end(function (patientSaveErr, patientSaveRes) {
        // Call the assertion callback
        done(patientSaveErr);
      });
  });

  it('should not be able to save an Patient if no name is provided', function (done) {
    // Invalidate name field
    patient.name = '';

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

        // Save a new Patient
        agent.post('/api/patients')
          .send(patient)
          .expect(400)
          .end(function (patientSaveErr, patientSaveRes) {
            // Set message assertion
            (patientSaveRes.body.message).should.match('Please fill Patient name');

            // Handle Patient save error
            done(patientSaveErr);
          });
      });
  });

  it('should be able to update an Patient if signed in', function (done) {
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

        // Save a new Patient
        agent.post('/api/patients')
          .send(patient)
          .expect(200)
          .end(function (patientSaveErr, patientSaveRes) {
            // Handle Patient save error
            if (patientSaveErr) {
              return done(patientSaveErr);
            }

            // Update Patient name
            patient.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Patient
            agent.put('/api/patients/' + patientSaveRes.body._id)
              .send(patient)
              .expect(200)
              .end(function (patientUpdateErr, patientUpdateRes) {
                // Handle Patient update error
                if (patientUpdateErr) {
                  return done(patientUpdateErr);
                }

                // Set assertions
                (patientUpdateRes.body._id).should.equal(patientSaveRes.body._id);
                (patientUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Patients if not signed in', function (done) {
    // Create new Patient model instance
    var patientObj = new Patient(patient);

    // Save the patient
    patientObj.save(function () {
      // Request Patients
      request(app).get('/api/patients')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Patient if not signed in', function (done) {
    // Create new Patient model instance
    var patientObj = new Patient(patient);

    // Save the Patient
    patientObj.save(function () {
      request(app).get('/api/patients/' + patientObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', patient.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Patient with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/patients/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Patient is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Patient which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Patient
    request(app).get('/api/patients/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Patient with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Patient if signed in', function (done) {
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

        // Save a new Patient
        agent.post('/api/patients')
          .send(patient)
          .expect(200)
          .end(function (patientSaveErr, patientSaveRes) {
            // Handle Patient save error
            if (patientSaveErr) {
              return done(patientSaveErr);
            }

            // Delete an existing Patient
            agent.delete('/api/patients/' + patientSaveRes.body._id)
              .send(patient)
              .expect(200)
              .end(function (patientDeleteErr, patientDeleteRes) {
                // Handle patient error error
                if (patientDeleteErr) {
                  return done(patientDeleteErr);
                }

                // Set assertions
                (patientDeleteRes.body._id).should.equal(patientSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Patient if not signed in', function (done) {
    // Set Patient user
    patient.user = user;

    // Create new Patient model instance
    var patientObj = new Patient(patient);

    // Save the Patient
    patientObj.save(function () {
      // Try deleting Patient
      request(app).delete('/api/patients/' + patientObj._id)
        .expect(403)
        .end(function (patientDeleteErr, patientDeleteRes) {
          // Set message assertion
          (patientDeleteRes.body.message).should.match('User is not authorized');

          // Handle Patient error error
          done(patientDeleteErr);
        });

    });
  });

  it('should be able to get a single Patient that has an orphaned user reference', function (done) {
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

          // Save a new Patient
          agent.post('/api/patients')
            .send(patient)
            .expect(200)
            .end(function (patientSaveErr, patientSaveRes) {
              // Handle Patient save error
              if (patientSaveErr) {
                return done(patientSaveErr);
              }

              // Set assertions on new Patient
              (patientSaveRes.body.name).should.equal(patient.name);
              should.exist(patientSaveRes.body.user);
              should.equal(patientSaveRes.body.user._id, orphanId);

              // force the Patient to have an orphaned user reference
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

                    // Get the Patient
                    agent.get('/api/patients/' + patientSaveRes.body._id)
                      .expect(200)
                      .end(function (patientInfoErr, patientInfoRes) {
                        // Handle Patient error
                        if (patientInfoErr) {
                          return done(patientInfoErr);
                        }

                        // Set assertions
                        (patientInfoRes.body._id).should.equal(patientSaveRes.body._id);
                        (patientInfoRes.body.name).should.equal(patient.name);
                        should.equal(patientInfoRes.body.user, undefined);

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
      Patient.remove().exec(done);
    });
  });
});
