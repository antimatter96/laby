var config = {};

config.knexConfig = {
  client: "mysql",
  debug: true,
};

if (process.env.PRO == 1) {
  config.knexConfig.debug = false;
  config.knexConfig.connection = {
    //
    //
    //
    //
  };
  config.knexConfig.pool = { min: 1, max: 5 };
}
else {
  config.knexConfig.connection = {
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
} else {
  let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
  config.morgan = { stream: accessLogStream };
}

config.crypto = {
  bcryptRounds: 10,
};

module.exports = config;
