function init(dbConfig) {
  var knex = require("./knex.js")(dbConfig);

  return {
    getUser: function(username) {
      return knex("users").select("_id", "password", "level").where({ "username": username });
    },

    userExists: function(username) {
      return knex("users").select("_id").where({ "username": username });
    },

    createUser: function (name, pass) {
      return knex("users").returning("_id").insert({ "username": name, "password": pass });
    },

    getLevel: function (userId) {
      return knex.select("level").from("users").where({ "_id": userId });
    },

    addAttempt: function (userId, level, ans) {
      return knex("attempts").returning("_id").insert({ "by": userId, "level": level, "attemptAnswer": ans });
    },

    addCorrect: function (userId, level, ans) {
      return knex("correct").returning("_id").insert({ "by": userId, "level": level, "attemptAnswer": ans });
    },

    updateLevel: function (userId) {
      return knex("users").where({ "_id": userId }).update({
        "updated_at": knex.fn.now(),
        "level": knex.raw("level + 1")
      });
    },

    getLeaderBoard: function () {
      return knex.select("name", "level").from("users").orderBy("level", "desc").orderBy("updated_at", "asc").limit(25);
    },

    getAllAttempts: function (userId) {
      return knex("attempts").where({ "by": userId }).orderBy("level").orderBy("created_at").limit(50);
    },
  };
}

module.exports = { init: init };
