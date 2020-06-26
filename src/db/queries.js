function init(dbConfig) {
  var knex = require("./knex.js")(dbConfig);

  return {
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

    createTeam: function (name, userId1, userId2, userId3) {
      if (!userId2) {
        return knex("teams").returning("_id").insert({ loginBy: userId1, name: name });
      }
      else if (!userId3) {
        return knex("teams").returning("_id").insert({ loginBy: userId1, secMemId: userId2, name: name });
      }
      else {
        return knex("teams").returning("_id").insert({ loginBy: userId1, secMemId: userId2, thirdMemId: userId3, name: name });
      }
    },

    isPart: function (userId1, userId2, userId3) {
      if (!userId2) {
        return knex.select("name").from("teams").where({ loginBy: userId1 }).orWhere({ secMemId: userId1 }).orWhere({ thirdMemId: userId1 });
      }
      else if (!userId3) {
        return knex.select("name").from("teams").where({ loginBy: userId1 }).orWhere({ secMemId: userId1 }).orWhere({ thirdMemId: userId1 }).orWhere({ loginBy: userId2 }).orWhere({ secMemId: userId2 }).orWhere({ thirdMemId: userId2 });
      }
      else {
        return knex.select("name").from("teams").where({ loginBy: userId1 }).orWhere({ secMemId: userId1 }).orWhere({ thirdMemId: userId1 }).orWhere({ loginBy: userId2 }).orWhere({ secMemId: userId2 }).orWhere({ thirdMemId: userId2 }).orWhere({ loginBy: userId3 }).orWhere({ secMemId: userId3 }).orWhere({ thirdMemId: userId3 });
      }
    },

    getLeaderBoard: function () {
      return knex.select("name", "level").from("teams").orderBy("level", "desc").orderBy("updated_at", "asc").limit(25);
    },

    getAllAttempts: function (teamId) {
      return knex("attempts").where({ by: teamId }).orderBy("level").orderBy("created_at").limit(50);
    },

    getLevel: function (teamId) {
      return knex.select("level").from("teams").where({ _id: teamId });
    },
  };
}

module.exports = { init: init };
