'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Student Schema
 */
var StudentSchema = new Schema({
  _id: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Denied'],
    default: 'Pending'
  }
});

mongoose.model('Student', StudentSchema);

/**
 * Course Schema
 */
var CourseSchema = new Schema({
  active: {
    type: Boolean,
    default: true
  },

  name: {
    type: String,
    default: '',
    required: 'Please fill Course name',
    trim: true
  },

  description: {
    type: String,
    default: '',
    trim: true
  },

  startDate: {
    type: Date,
    required: 'Please enter a start date'
  },
  endDate: {
    type: Date,
    required: 'Please enter an end date'
  },

  request: {
    type: Schema.ObjectId,
    ref: 'Request'
  },

  students: [StudentSchema],

  patients: [{
    type: Schema.ObjectId,
    ref: 'Patient'
  }],

  created: {
    type: Date,
    default: Date.now
  },

  /*teacher*/
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Course', CourseSchema);
