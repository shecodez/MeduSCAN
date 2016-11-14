'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Medication Schema
 */
var MedicationSchema = new Schema({
  active: {
    type: Boolean,
    default: true
  },
  mID: {
    // unique: true,
    type: String,
    trim: true
  },

  avatar: { type: String },
  name: {
    type: String,
    default: '',
    required: 'Medication name required',
    trim: true
  },
  type: {
    type: String,
    enum: ['Generic', 'Brand', 'Fictitious']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  drugClass: {
    type: String,
    trim: true,
    default: ''
  },

  pregnancyCategory: {
    type: String,
    enum: ['Category A', 'Category B', 'Category C', 'Category D', 'Category X', 'Category N']
  },

  amount: { type: Number, required: 'Med amt required' },
  form: {
    type: String,
    trim: true,
    default: ''
  },
  strength: { type: Number, required: 'Med str required' },
  unit: {
    type: String,
    trim: true,
    default: ''
  },

  updated: { type: Date },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Medication', MedicationSchema);
