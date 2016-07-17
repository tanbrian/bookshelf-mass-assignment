/** @file A Bookshelf plugin for handling mass-assignment vulnerabilities. */

const Promise = require('bluebird');
const _ = require('lodash');

const { ImproperlyConfiguredError, MassAssignmentError } = require('./errors');

module.exports = (bookshelf) => {
  const proto = bookshelf.Model.prototype;

  const Model = bookshelf.Model.extend({
    // Replaced with an array of attributes to allow user modification on.
    fillable: null,

    // Replaced with an array of attributes to prevent user modification on.
    guarded: null,

    /**
     * Overrides fillable and guarded fields on the model's prototype if any
     * are defined in options.
     */
    constructor(...args) {
      proto.constructor.call(this, ...args);
      const options = args[1] || {};

      if (options.fillable && options.guarded) {
        throw new ImproperlyConfiguredError(
          'Cannot specify both fillable and guarded options.'
        );
      }

      if (options.fillable) this.fillable = _.clone(options.fillable);
      if (options.guarded) this.guarded = _.clone(options.guarded);
    },

    /**
     * Overrides save to return a rejected Promise if any attributes that are
     * to be set are protected from user modification via a fillable or guarded
     * array.
     *
     * @return Promise<Model> Rejected Promise if any properties in attrs are
     * protected. Otherwise, returns the Promise returned by the super
     * implementation.
     *
     */
    save(key, val, options) {
      let attrs;

      // Handles both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key || {};
        options = _.clone(val) || {};
      } else {
        (attrs = {})[key] = val;
        options = options ? _.clone(options) : {};
      }

      // Save is invalid if any field in attrs is not in the fillable array.
      if (this.fillable && Object.keys(attrs).some(attr => this.fillable.indexOf(attr) === -1)) {
        return Promise.reject(new MassAssignmentError(
          'Couldn\'t save model! Attributes are invalid.'
        ));
      }

      // Save is invalid if any field in attrs is also in the guarded array.
      if (this.guarded && Object.keys(attrs).some(attr => this.guarded.indexOf(attr) >= 0)) {
        return Promise.reject(new MassAssignmentError(
          'Couldn\'t save model! Attributes are invalid.'
        ));
      }

      return proto.save.call(this, attrs, options);
    },
  });

  bookshelf.Model = Model;
};
