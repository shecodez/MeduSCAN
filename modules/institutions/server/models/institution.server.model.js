'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Teacher Schema
 */
var TeacherSchema = new Schema({
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

mongoose.model('Teacher', TeacherSchema);

/**
 * Institution Schema
 */
var InstitutionSchema = new Schema({
  active: {
    type: Boolean,
    default: true
  },

  name: {
    type: String,
    default: '',
    required: 'Please fill Institution name',
    trim: true
  },
  ceebCode: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    street: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    zip: { type: String, default: '', trim: true }
  },
  website:{
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },

  request: {
    type: Schema.ObjectId,
    ref: 'Request'
  },

  teachers: [TeacherSchema],

  key: {
    type: Schema.ObjectId,
    ref: 'Key'
  },

  created: {
    type: Date,
    default: Date.now
  },

  /*admin*/
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Institution', InstitutionSchema);
