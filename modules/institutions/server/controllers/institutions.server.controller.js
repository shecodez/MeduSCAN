'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Institution = mongoose.model('Institution'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Institution
 */
exports.create = function(req, res) {
  var institution = new Institution(req.body);
  institution.user = req.user;

  institution.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(institution);
    }
  });
};

/**
 * Show the current Institution
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var institution = req.institution ? req.institution.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  institution.isCurrentUserOwner = !!(req.user && institution.user && institution.user._id.toString() === req.user._id.toString());

  res.jsonp(institution);
};

/**
 * Update a Institution
 */
exports.update = function(req, res) {
  var institution = req.institution;

  institution = _.extend(institution, req.body);

  institution.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(institution);
    }
  });
};

/**
 * Delete an Institution
 */
exports.delete = function(req, res) {
  var institution = req.institution;

  institution.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(institution);
    }
  });
};

/**
 * List of Institutions
 */
exports.list = function(req, res) {
  Institution.find().sort('-created').populate('user', 'displayName').exec(function(err, institutions) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(institutions);
    }
  });
};

/**
 * Institution middleware
 */
exports.institutionByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Institution is invalid'
    });
  }

  Institution.findById(id).populate('user', 'displayName')
    .populate({
      path: 'teachers',
      model: 'Teacher',
      populate: {
        path: '_id',
        model: 'User',
        select: 'displayName email'
      }
    })
    .populate({
      path: 'request',
      model: 'Request',
      select: 'subscribers',
      populate: {
        path: 'subscribers',
        model: 'User',
        select: 'displayName email'
      }
    }) // Trinh Hoang Nhu - SO
    .exec(function (err, institution) {
      if (err) {
        return next(err);
      } else if (!institution) {
        return res.status(404).send({
          message: 'No Institution with that identifier has been found'
        });
      }
      req.institution = institution;
      next();
    });
};
