
exports.up = function(knex) {
  return knex.schema
    .createTable("users", function(table) {
      table.string("username").unique().comment("this is the username").notNullable();
      table.increments("_id").primary();
      table.string("password").notNullable();
      table.integer("level").notNullable().defaultTo(0);
      table.timestamps(false, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable("users");
};
