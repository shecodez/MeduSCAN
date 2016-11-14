'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Tutorial Schema
 */
var TutorialSchema = new Schema({
  category: {
    type: String,
    default:'Uncategorized',
    trim: true
  },
  title: {
    type: String,
    default: '',
    required: 'Tutorial requires a title',
    trim: true
  },
  content: {
    type: String,
    default: '',
    required: 'Please fill Tutorial content',
    trim: true
  },
  tags: [{ type: String }],

  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Tutorial', TutorialSchema);
