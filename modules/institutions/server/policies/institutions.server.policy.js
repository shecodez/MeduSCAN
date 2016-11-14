'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Institutions Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/institutions',
      permissions: '*'
    }, {
      resources: '/api/institutions/:institutionId',
      permissions: '*'
    }]
  }, {
    roles: ['teacher'],
    allows: [{
      resources: '/api/institutions',
      permissions: ['get'] //TODO: where teacher $in institution.teacher
    }, {
      resources: '/api/institutions/:institutionId',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [/*{
      resources: '/api/institutions',
      permissions: ['get']
    },*/{
      resources: '/api/institutions/:institutionId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Institutions Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Institution is being processed and the current user created it then allow any manipulation
  if (req.institution && req.user && req.institution.user && req.institution.user.id === req.user.id) {
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
