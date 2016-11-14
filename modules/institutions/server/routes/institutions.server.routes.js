'use strict';

/**
 * Module dependencies
 */
var institutionsPolicy = require('../policies/institutions.server.policy'),
  institutions = require('../controllers/institutions.server.controller');

module.exports = function(app) {
  // Institutions Routes
  app.route('/api/institutions').all(institutionsPolicy.isAllowed)
    .get(institutions.list)
    .post(institutions.create);

  app.route('/api/institutions/:institutionId').all(institutionsPolicy.isAllowed)
    .get(institutions.read)
    .put(institutions.update)
    .delete(institutions.delete);

  // Finish by binding the Institution middleware
  app.param('institutionId', institutions.institutionByID);
};
