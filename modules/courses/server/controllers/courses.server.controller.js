'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Course = mongoose.model('Course'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Count of Courses
 */
exports.courseCount = function(req, res) {
  Course.count({}, function(err, courseCount) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var data = {};
      data.count = courseCount;
      res.jsonp(data);
    }
  });
};

/**
 * Create a Course
 */
exports.create = function(req, res) {
  var course = new Course(req.body);
  course.user = req.user;

  course.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(course);
    }
  });
};

/**
 * Show the current Course
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var course = req.course ? req.course.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  course.isCurrentUserOwner = !!(req.user && course.user && course.user._id.toString() === req.user._id.toString());

  res.jsonp(course);
};

/**
 * Update a Course
 */
exports.update = function(req, res) {
  var course = req.course;

  course = _.extend(course, req.body);

  course.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(course);
    }
  });
};

/**
 * Delete an Course
 */
exports.delete = function(req, res) {
  var course = req.course;

  course.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(course);
    }
  });
};

/**
 * List of Courses
 */
exports.list = function(req, res) {
  Course.find({ 'user': req.user }).sort('-created').populate('user', 'displayName').exec(function(err, courses) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(courses);
    }
  });
};

/**
 * Course middleware
 */
exports.courseByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Course is invalid'
    });
  }

  Course.findById(id).populate('user', 'displayName')
    .populate({
      path: 'students',
      model: 'Student',
      populate: {
        path: '_id',
        model: 'User',
        select: 'displayName email'
      }
    })
    .populate({
      path: 'patients',
      model: 'Patient',
      select: 'firstName lastName active'
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
    })
    .exec(function (err, course) {
      if (err) {
        return next(err);
      } else if (!course) {
        return res.status(404).send({
          message: 'No Course with that identifier has been found'
        });
      }
      req.course = course;
      next();
    });
};
