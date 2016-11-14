'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Key = mongoose.model('Key'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Key
 */
exports.create = function(req, res) {
  var key = new Key(req.body);
  key.user = req.user;

  key.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(key);
    }
  });
};

/**
 * Show the current Key
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var key = req.key ? req.key.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  key.isCurrentUserOwner = req.user && key.user && key.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(key);
};

/**
 * Update a Key
 */
exports.update = function(req, res) {
  var key = req.key ;

  key = _.extend(key , req.body);

  key.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(key);
    }
  });
};

/**
 * Delete an Key
 */
exports.delete = function(req, res) {
  var key = req.key ;

  key.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(key);
    }
  });
};

/**
 * List of Keys
 */
exports.list = function(req, res) { 
  Key.find().sort('-created').populate('user', 'displayName').exec(function(err, keys) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(keys);
    }
  });
};

/**
 * Key middleware
 */
exports.keyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Key is invalid'
    });
  }

  Key.findById(id).populate('user', 'displayName').exec(function (err, key) {
    if (err) {
      return next(err);
    } else if (!key) {
      return res.status(404).send({
        message: 'No Key with that identifier has been found'
      });
    }
    req.key = key;
    next();
  });
};
