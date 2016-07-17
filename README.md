## bookshelf-mass-assignment

[![Build Status](https://travis-ci.org/tanbrian/bookshelf-mass-assignment.svg?branch=master)](https://travis-ci.org/tanbrian/bookshelf-mass-assignment)

A Bookshelf plugin that provides `fillable` and `guarded` properties on the model to prevent certain properties from being mass-assignable. Inspired by Laravel's Eloquent ORM.

### Installation

Install the module from `npm`:

```
npm install bookshelf-mass-assignment
```

### Usage

Initialize the plugin with:

```javascript
const bookshelf = require('bookshelf');
bookshelf.plugin(require('bookshelf-mass-assignment'));
```

Then in your Bookshelf models, you can use the `fillable` or `guarded` properties:

```javascript
const User = bookshelf.Model('User', {
  tableName: 'users',

  // Specifies that only these user properties are mass-assignable.
  fillable: ['email', 'first_name', 'last_name']
});
```

The `fillable` property serves as a list of whitelisted user attributes that can be modified. Alternatively, you can use the `guarded` property to specify a blacklist of user attributes that cannot be modified:

```javascript
const User = bookshelf.Model('User', {
  tableName: 'users',

  // Specifies that these properties are not mass-assignable.
  guarded: ['id', 'is_admin']
});
```

Then save the model as usual:

```javascript
new User().save({ first_name: 'Bob', is_admin: true })
  .then(user => console.log('Successfully saved user!'))
  .catch(err => console.log(err.message)); // Couldn\'t save model! Attributes are invalid.
```

If you don't want a hard error to be thrown when protected attributes are present, then add `silent: true` to the `options` object in `save`. This will ignore any attributes not in `fillable` if `fillable` is specified, or will ignore any attributes in `guarded` if `guarded` is specified:

```javascript
new User().save({ first_name: 'Bob', is_admin: true }, { silent: true })
  .then(user => console.log('Successfully saved user!')) // Only saved { first:name: 'Bob' }.
  .catch(err => console.log(err.message));
```

Note that you can only use either `fillable` or `guarded`, not both.

### License

Licensed under the terms of the [MIT License](LICENSE).
