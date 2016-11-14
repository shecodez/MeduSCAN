'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Medications Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/medications',
      permissions: '*'
    }, {
      resources: '/api/medications/:medicationId',
      permissions: '*'
    }]
  }, {
    roles: ['teacher'],
    allows: [{
      resources: '/api/medications',
      permissions: ['get', 'post']
    }, {
      resources: '/api/medications/:medicationId',
      permissions: ['get']
    }]
  }, {
    roles: ['student'],
    allows: [{
      resources: '/api/medications',
      permissions: ['get']
    }, {
      resources: '/api/medications/:medicationId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Medications Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Medication is being processed and the current user created it then allow any manipulation
  if (req.medication && req.user && req.medication.user && req.medication.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
