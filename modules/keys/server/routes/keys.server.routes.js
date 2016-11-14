'use strict';

/**
 * Module dependencies
 */
var keysPolicy = require('../policies/keys.server.policy'),
  keys = require('../controllers/keys.server.controller');

module.exports = function(app) {
  // Keys Routes
  app.route('/api/keys').all(keysPolicy.isAllowed)
    .get(keys.list)
    .post(keys.create);

  app.route('/api/keys/:keyId').all(keysPolicy.isAllowed)
    .get(keys.read)
    .put(keys.update)
    .delete(keys.delete);

  // Finish by binding the Key middleware
  app.param('keyId', keys.keyByID);
};
