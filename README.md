*Still a work in progress! Things will probably break.*

A Bookshelf plugin that provides `fillable` and `guarded` properties on the model to prevent certain properties from being mass-assignable. Inspired by Laravel's Eloquent ORM.

#### Usage

In your Bookshelf models:

```
require('bookshelf');
require('bookshelf-mass-assignment');

const User = bookshelf.Model('User', {
  tableName: 'users',

  // Specifies that only these user properties are mass-assignable.
  fillable: ['email', 'first_name', 'last_name']
});
```

The `fillable` property serves as a list of whitelisted user attributes that can be modified. Alternatively, you can use the `guarded` property to specify a blacklist of user attributes that cannot be modified:

```
const User = bookshelf.Model('User', {
  tableName: 'users',

  // Specifies that these properties are not mass-assignable.
  guarded: ['id', 'is_admin']
});
```

You can only use either `fillable` or `guarded`, not both.

#### To-do

* Add a `silent` flag that deletes the offending attributes instead of failing the save Promise
* Support `*` for the `guarded` property that blocks all attributes of the model from mass-assignment
