'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Request Schema
 */
var RequestSchema = new Schema({
  for_id: {
    type: Schema.ObjectId,
    required: 'ID of what the request is for is required'
  },
  type: {
    type: String,
    enum: ['Course', 'Institution', 'Key'],
    required: 'Request type required'
  },

  subscribers: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],

  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Request', RequestSchema);
