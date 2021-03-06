/** @file A Bookshelf plugin for handling mass-assignment vulnerabilities. */

const Promise = require('bluebird');
const _ = require('lodash');

const { ImproperlyConfiguredError, MassAssignmentError } = require('./errors');

module.exports = bookshelf => {
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

      if (options.fillable) this.fillable = _.clone(options.fillable);
      if (options.guarded) this.guarded = _.clone(options.guarded);

      this.silent = options.silent ? options.silent : false;
    },

    /**
     * Overrides save to return a rejected Promise if any attributes that are
     * to be set are protected from user modification via a fillable or guarded
     * array.
     *
     * @param {Object|String} key Object with attribute-value pairs to be set,
     * or an attribute name.
     * @param {mixed} val If defined, the value of key attribute.
     * @param {Object} options Can also include a silent property to decide
     * whether to reject or continue silently with invalid attributes.
     *
     * @return {Promise<Model>} Rejected Promise if any properties in attrs are
     * protected. Otherwise, returns the Promise returned by the super
     * implementation.
     *
     */
    save(key, val, options) {
      let attrs;

      // Handles both `"key", value` and `{key: value}` -style arguments.
      if (key === null || typeof key === 'object') {
        attrs = key || {};
        options = _.clone(val) || {};
      } else {
        (attrs = {})[key] = val;
        options = options ? _.clone(options) : {};
      }

      if (this.fillable && this.guarded) {
        throw new ImproperlyConfiguredError(
          'Cannot specify both fillable and guarded options.'
        );
      }

      // Save is invalid if any field in attrs is also in the guarded array.
      if ((this.guarded && Object.keys(attrs).some(attr => this.guarded.indexOf(attr) >= 0)) ||
          (this.fillable && Object.keys(attrs).some(attr => this.fillable.indexOf(attr) === -1))) {
        // If { silent: false } (default), then throws a hard error.
        if (!options.silent) {
          return Promise.reject(new MassAssignmentError(
            'Couldn\'t save model! Attributes are invalid.'
          ));
        }

        Object.keys(attrs).forEach(attr => {
          if ((this.fillable && this.fillable.indexOf(attr) === -1) ||
              (this.guarded && this.guarded.indexOf(attr) >= 0)) {
            delete attrs[attr];
          }
        });
      }

      return proto.save.call(this, attrs, options);
    }
  });

  bookshelf.Model = Model;
};
