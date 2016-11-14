'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Medication = mongoose.model('Medication'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Medication
 */
exports.create = function(req, res) {
  var medication = new Medication(req.body);
  medication.user = req.user;

  medication.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(medication);
    }
  });
};

/**
 * Show the current Medication
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var medication = req.medication ? req.medication.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  medication.isCurrentUserOwner = req.user && medication.user && medication.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(medication);
};

/**
 * Update a Medication
 */
exports.update = function(req, res) {
  var medication = req.medication ;

  medication = _.extend(medication , req.body);

  medication.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(medication);
    }
  });
};

/**
 * Delete an Medication
 */
exports.delete = function(req, res) {
  var medication = req.medication ;

  medication.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(medication);
    }
  });
};

/**
 * List of Medications
 */
exports.list = function(req, res) { 
  Medication.find({'user':req.user}).sort('-created').populate('user', 'displayName').exec(function(err, medications) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(medications);
    }
  });
};

/**
 * Medication middleware
 */
exports.medicationByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Medication is invalid'
    });
  }

  Medication.findById(id).populate('user', 'displayName').exec(function (err, medication) {
    if (err) {
      return next(err);
    } else if (!medication) {
      return res.status(404).send({
        message: 'No Medication with that identifier has been found'
      });
    }
    req.medication = medication;
    next();
  });
};
