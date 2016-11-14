'use strict';

/**
 * Module dependencies
 */
var medicationsPolicy = require('../policies/medications.server.policy'),
  medications = require('../controllers/medications.server.controller');

module.exports = function(app) {
  // Medications Routes
  app.route('/api/medications').all(medicationsPolicy.isAllowed)
    .get(medications.list)
    .post(medications.create);

  app.route('/api/medications/:medicationId').all(medicationsPolicy.isAllowed)
    .get(medications.read)
    .put(medications.update)
    .delete(medications.delete);

  // Finish by binding the Medication middleware
  app.param('medicationId', medications.medicationByID);
};
