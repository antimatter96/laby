var knex = require("./knex.js");

function addAttempt(teamId, level, ans) {
  return knex("attempts").returning("_id").insert({ by : teamId, level : level, attemptAnswer : ans});
}

function addCorrect(teamId, level, ans) {
  return knex("correct").returning("_id").insert({ by : teamId, level : level, attemptAnswer: ans});
}

function updateLevel(teamId) {
  return knex("teams").where({ _id : teamId}).update({
    updated_at : knex.fn.now(),
    level : knex.raw("level + 1")
  });
}

function getTeamName(userId) {
  return knex("teams").where({ loginBy : userId});
}

function isTeamNameTaken(name) {
  return knex.count("name").from("teams").where({ name : name});
}

function createTeam(name, userId1, userId2, userId3) {
  if(!userId2) {
    return knex("teams").returning("_id").insert({ loginBy : userId1, name: name});	
  }
  else if(!userId3) {
    return knex("teams").returning("_id").insert({ loginBy : userId1, secMemId : userId2, name: name});	
  }
  else{
    return knex("teams").returning("_id").insert({ loginBy : userId1, secMemId : userId2, thirdMemId : userId3, name: name});	
  }
}

function isPart(userId1, userId2, userId3) {
  if(!userId2) {
    return knex.select("name").from("teams").where({ loginBy : userId1}).orWhere({ secMemId : userId1}).orWhere({ thirdMemId : userId1});
  }
  else if(!userId3) {
    return knex.select("name").from("teams").where({ loginBy : userId1}).orWhere({ secMemId : userId1}).orWhere({ thirdMemId : userId1}).orWhere({ loginBy : userId2}).orWhere({ secMemId : userId2}).orWhere({ thirdMemId : userId2});
  }
  else{
    return knex.select("name").from("teams").where({ loginBy : userId1}).orWhere({ secMemId : userId1}).orWhere({ thirdMemId : userId1}).orWhere({ loginBy : userId2}).orWhere({ secMemId : userId2}).orWhere({ thirdMemId : userId2}).orWhere({ loginBy : userId3}).orWhere({ secMemId : userId3}).orWhere({ thirdMemId : userId3});
  }
}

function getLeaderBoard() {
  return knex.select("name","level").from("teams").orderBy("level","desc").orderBy("updated_at","asc").limit(25);
}

function getAllAttempts(teamId) {
  return knex("attempts").where({ by : teamId }).orderBy("level").orderBy("created_at").limit(50);
}

function getLevel(teamId) {
  return knex.select("level").from("teams").where({ _id : teamId });
}

module.exports = {
  addAttempt: addAttempt,
  addCorrect: addCorrect,
  updateLevel: updateLevel,
  getTeamName: getTeamName,
  isTeamNameTaken: isTeamNameTaken,
  createTeam: createTeam,
  isPart: isPart,
  getLeaderBoard: getLeaderBoard,
  getAllAttempts: getAllAttempts,
  getLevel: getLevel
};