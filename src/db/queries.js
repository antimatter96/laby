function init(dbConfig) {
  var knex = require("./knex.js")(dbConfig);

  return {
    getUser: function(username) {
      return knex("users").select("_id", "password", "level").where({ "username": username });
    },

    addAttempt: function (teamId, level, ans) {
      return knex("attempts").returning("_id").insert({ by: teamId, level: level, attemptAnswer: ans });
    },

    addCorrect: function (teamId, level, ans) {
      return knex("correct").returning("_id").insert({ by: teamId, level: level, attemptAnswer: ans });
    },

    updateLevel: function (teamId) {
      return knex("teams").where({ _id: teamId }).update({
        updated_at: knex.fn.now(),
        level: knex.raw("level + 1")
      });
    },

    getTeamName: function (userId) {
      return knex("teams").where({ loginBy: userId });
    },

    isTeamNameTaken: function (name) {
      return knex.count("name").from("teams").where({ name: name });
    },

    createUser: function (name, pass) {
      return knex("user").returning("_id").insert({ username: name, password: pass });
    },

    getLeaderBoard: function () {
      return knex.select("name", "level").from("teams").orderBy("level", "desc").orderBy("updated_at", "asc").limit(25);
    },

    getAllAttempts: function (userId) {
      return knex("attempts").where({ by: userId }).orderBy("level").orderBy("created_at").limit(50);
    },

    getLevel: function (userId) {
      return knex.select("level").from("user").where({ _id: userId });
    },
  };
}

module.exports = { init: init };
