'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Patient = mongoose.model('Patient'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Patient
 */
exports.create = function(req, res) {
  var patient = new Patient(req.body);
  patient.user = req.user;

  patient.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(patient);
    }
  });
};

/**
 * Show the current Patient
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var patient = req.patient ? req.patient.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  patient.isCurrentUserOwner = req.user && patient.user && patient.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(patient);
};

/**
 * Update a Patient
 */
exports.update = function(req, res) {
  var patient = req.patient ;

  patient = _.extend(patient , req.body);

  patient.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(patient);
    }
  });
};

/**
 * Delete an Patient
 */
exports.delete = function(req, res) {
  var patient = req.patient ;

  patient.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(patient);
    }
  });
};

/**
 * List of Patients
 */
exports.list = function(req, res) { 
  Patient.find({'user':req.user}).sort('-created').populate('user', 'displayName').exec(function(err, patients) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(patients);
    }
  });
};

/**
 * Patient middleware
 */
exports.patientByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Patient is invalid'
    });
  }

  Patient.findById(id).populate('user', 'displayName')
    .populate({
      path: 'medications',
      model: 'PatientMedication',
      populate: {
        path: '_id',
        model: 'Medication'
      }
    })
    .exec(function (err, patient) {
    if (err) {
      return next(err);
    } else if (!patient) {
      return res.status(404).send({
        message: 'No Patient with that identifier has been found'
      });
    }
    req.patient = patient;
    next();
  });
};
