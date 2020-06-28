
exports.up = function(knex) {
  return knex.schema.
    alterTable("users", function(table) {
      table.index("username");
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable("users", function(table) {
      table.dropIndex("username");
    });
};
