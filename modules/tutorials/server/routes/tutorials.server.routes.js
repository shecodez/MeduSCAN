'use strict';

/**
 * Module dependencies
 */
var tutorialsPolicy = require('../policies/tutorials.server.policy'),
  tutorials = require('../controllers/tutorials.server.controller');

module.exports = function(app) {
  // Tutorials Routes
  app.route('/api/tutorials').all(tutorialsPolicy.isAllowed)
    .get(tutorials.list)
    .post(tutorials.create);

  app.route('/api/tutorials/:tutorialId').all(tutorialsPolicy.isAllowed)
    .get(tutorials.read)
    .put(tutorials.update)
    .delete(tutorials.delete);

  // Finish by binding the Tutorial middleware
  app.param('tutorialId', tutorials.tutorialByID);
};
