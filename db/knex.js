var knexConfig = require('../config').knex;
var knex = require('knex')(knexConfig);

module.exports = knex;