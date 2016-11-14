'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Key Schema
 */
var KeySchema = new Schema({
  active: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['Trial', 'Beta Tester', 'Single Session', 'Annual License'],
    required: 'Key type required',
    default: 'Trial'
  },
  // Remove this after beta
  betaTesters: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],

  registeredTo: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Who the key is registered to is required'
  },
  upgraded: {
    type: Boolean,
    default: false
  },

  // Activation - begins when upgraded...
  // Expiration - Single Session = one course session /
  // Expiration - Annual License = one institution year
  activationDate: {
    type: Date
  },
  expirationDate: {
    type: Date
  },

  // Trial begins when created & ends in 14 days
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Key', KeySchema);
