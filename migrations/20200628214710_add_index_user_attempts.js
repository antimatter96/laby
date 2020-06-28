
exports.up = function(knex) {
  return knex.schema.
    alterTable("correct", function(table) {
      table.integer("by").unsigned().notNullable().alter();
      table.foreign("by").references("_id").inTable("users");
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable("correct", function(table) {
      table.string("by").notNullable();
      table.dropForeign("by");
    });
};
