const fs = require("fs");
const path = require("path");

var knexConfig = require("./knexfile");

var config = {};

config.nunjucksConfig = {};
config.sessionConfig = {};
config.redisConfig = {};

config.nunjucksConfig = {
  autoescape: true,
  watch: true,
  noCache: true,
};

config.sessionConfig = {
  resave: false,
  saveUninitialized: false,
  name: "appSessionId",
  cookie: { maxAge: 43200000 },
  secret: "secretkeyoflength256bits",
};

config.redisConfig = {
  host: "localhost",
  port: "6379",
};

config.port = process.env.PORT || 8080;

if (process.env.PRO == 1) {
  console.log("Using Production");
  config.nunjucksConfig.noCache = false;
  config.sessionConfig.secret = process.env.SESSION_SECRET;
  config.redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  };
  let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
  config.morgan = { stream: accessLogStream };
  config.knexConfig = knexConfig.production;
} else {
  let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
  config.morgan = { stream: accessLogStream };
  config.knexConfig = knexConfig.development;
}

config.crypto = {
  bcryptRounds: 10,
};

module.exports = config;
