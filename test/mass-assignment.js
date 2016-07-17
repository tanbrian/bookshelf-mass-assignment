const expect = require('chai').expect;
const assert = require('chai').assert;

const knex = require('knex');
const massAssignment = require('..');

const bookshelf = require('bookshelf')(knex({
  client: 'sqlite3',
  connection: {
    filename: 'test/test.sqlite'
  },
  useNullAsDefault: true
}));

const config = { directory: 'test/migrations' };

describe('mass assignment plugin', function() {
  before('register mass-assignment plugin and set up test database', function(done) {
    bookshelf.plugin(massAssignment);
    return bookshelf.knex.migrate.latest(config)
      .then(() => done());
  });

  after('rollback test database', function(done) {
    return bookshelf.knex.migrate.rollback(config)
      .then(() => done());
  });

  describe('fillable behavior', function() {
    let User;

    before('set up model', function() {
      User = bookshelf.Model.extend({
        tableName: 'users',
        fillable: ['first_name']
      });
    });

    it('saves when only provided attributes in fillable', function() {
      return new User().save({ first_name: 'Bob' })
        .then(user => expect(user.get('first_name')).to.equal('Bob'));
    });

    it('fails to save when provided an attribute not in fillable', function() {
        return new User().save({ first_name: 'Jack', is_admin: true })
          .then(user => Promise.reject(new Error('User was saved.')))
          .catch(err => expect(err.message).to.equal('Couldn\'t save model! Attributes are invalid.'));
    });
  });

  describe('guarded behavior', function() {
    let User;

    before('set up model', function() {
      User = bookshelf.Model.extend({
        tableName: 'users',
        guarded: ['id', 'is_admin']
      });
    });

    it('saves when all attributes provided are not in guarded', function() {
      return new User().save({ first_name: 'Joe' })
        .then(user => expect(user.get('first_name')).to.equal('Joe'));
    });

    it('fails to save when provided an attribute in guarded', function() {
      return new User().save({ first_name: 'Billy', is_admin: true })
        .then(user => Promise.reject(new Error('User was saved.')))
        .catch(err => expect(err.message).to.equal('Couldn\'t save model! Attributes are invalid.'));
    });
  });
});