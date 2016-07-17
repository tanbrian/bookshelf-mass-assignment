/** @file Defines custom errors used in mass-assigment plugin. */

/**
 * Indicates that the plugin is not being properly used.
 * @param {String} message Error message to print.
 */
function ImproperlyConfiguredError(message) {
  this.name = 'ImproperlyConfiguredError';
  this.message = message || 'Improperly configured.';
  this.stack = (new Error()).stack;
}

ImproperlyConfiguredError.prototype = Object.create(Error.prototype);
ImproperlyConfiguredError.prototype.constructor = ImproperlyConfiguredError;

/**
 * Indicates that an attempt was made to modify a property that is not
 * mass-assignable.
 * @param {String} message Error message to print.
 */
function MassAssignmentError(message) {
  this.name = 'MassAssignmentError';
  this.message = message || 'Can\'t mass-assign protected attributes.';
  this.stack = (new Error()).stack;
}

MassAssignmentError.prototype = Object.create(Error.prototype);
MassAssignmentError.prototype.constructor = MassAssignmentError;

module.exports = { ImproperlyConfiguredError, MassAssignmentError };
