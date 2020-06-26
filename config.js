var config = {};

config.knex = {
  client: "mysql",
  debug: true,
};

if (process.env.PRO == 1) {
  config.knex.debug = false;
  config.knex.connection = {
    //
    //
    //
    //
  };
  config.knex.pool = { min: 1, max: 5 };
}
else {
  config.knex.connection = {
    host: '127.0.0.1',
    //
    //
    //
  };
}

config.mokshaAuth = {
  "url": 'http://www.mokshansit.com/login',
  "msg": {
    "wrongP": "Wrong Password",
    "success": "success",
    "invalidId": "Moksha ID does not exist",
  }
};


const fs = require("fs");
const path = require("path");

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

if (process.env.PRO == 1) {
  console.log("Using Production");
  config.nunjucksConfig.noCache = false;
  config.sessionConfig.secret = process.env.SESSION_SECRET;
  config.redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  };
  config.port = process.env.PORT || 8080;
  let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
  config.morgan = { stream: accessLogStream };
} else {
  let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
  config.morgan = { stream: accessLogStream };
}

config.crypto = {
  bcryptRounds: 10,
};

module.exports = config;
