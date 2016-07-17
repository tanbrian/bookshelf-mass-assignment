exports.up = (knex, Promise) =>
  knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('first_name');
    table.string('last_name');
    table.string('password');
    table.boolean('is_admin');
  });

exports.down = (knex, Promise) =>
  knex.schema.dropTable('users');
