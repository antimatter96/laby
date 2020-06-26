var knex = require("knex");

function createClient(config) {
  return knex(config);
}

module.exports = createClient;
