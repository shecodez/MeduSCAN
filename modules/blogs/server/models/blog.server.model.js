'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Blog Schema
 */
var BlogSchema = new Schema({
  category: {
    type: String,
    default:'Uncategorized',
    trim: true
  },
  title: {
    type: String,
    default: '',
    required: 'Blog requires a title',
    trim: true
  },
  content: {
    type: String,
    default: '',
    required: 'Please fill Blog content',
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

mongoose.model('Blog', BlogSchema);
