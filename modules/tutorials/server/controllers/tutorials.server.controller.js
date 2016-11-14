'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Tutorial = mongoose.model('Tutorial'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Tutorial
 */
exports.create = function(req, res) {
  var tutorial = new Tutorial(req.body);
  tutorial.user = req.user;

  tutorial.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tutorial);
    }
  });
};

/**
 * Show the current Tutorial
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var tutorial = req.tutorial ? req.tutorial.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  tutorial.isCurrentUserOwner = !!(req.user && tutorial.user && tutorial.user._id.toString() === req.user._id.toString());

  res.jsonp(tutorial);
};

/**
 * Update a Tutorial
 */
exports.update = function(req, res) {
  var tutorial = req.tutorial;

  tutorial = _.extend(tutorial, req.body);

  tutorial.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tutorial);
    }
  });
};

/**
 * Delete an Tutorial
 */
exports.delete = function(req, res) {
  var tutorial = req.tutorial;

  tutorial.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tutorial);
    }
  });
};

/**
 * List of Tutorials
 */
exports.list = function(req, res) {
  Tutorial.find().sort('-created').populate('user', 'displayName').exec(function(err, tutorials) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tutorials);
    }
  });
};

/**
 * Tutorial middleware
 */
exports.tutorialByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Tutorial is invalid'
    });
  }

  Tutorial.findById(id).populate('user', 'displayName').exec(function (err, tutorial) {
    if (err) {
      return next(err);
    } else if (!tutorial) {
      return res.status(404).send({
        message: 'No Tutorial with that identifier has been found'
      });
    }
    req.tutorial = tutorial;
    next();
  });
};
