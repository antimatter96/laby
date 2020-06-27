
exports.up = function (knex) {
  return knex.schema
    .createTable("attempts", function (table) {
      table.increments("_id").primary();
      table.string("by").notNullable();
      table.integer("level").notNullable();
      table.string("attemptAnswer").notNullable();
      table.dateTime("created_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("attempts");
};
