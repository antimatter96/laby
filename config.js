var config = {};
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

config.nunjucks = {};
config.knex = {};
config.sessionConfig = {};

config.nunjucks.autoescape = true;
config.nunjucks.watch = true;
config.nunjucks.noCache = true;

config.knex.client = 'mysql';
config.knex.debug = true;

config.sessionConfig.resave = false;
config.sessionConfig.secret = "secretkeyoflength256bits";
config.sessionConfig.saveUninitialized = false;
config.sessionConfig.name = 'appSessionId';
config.sessionConfig.cookie = { maxAge: 43200000 };

if(process.env.PRO == 1) {
	config.nunjucks.noCache = false;
	config.knex.debug = false;
	config.knex.connection = {
		//
		//
		//
		//
	};
	config.knex.pool = { min: 1, max: 5 };
	
	config.sessionConfig.secret = "secrcetodfw4sege34yhsaeffgh65d890tce5664esx0drandomlygenerated";
	config.sessionConfig.store = new RedisStore({
		//
		//
		//
	});
}
else{
	config.knex.connection = {
		host:'127.0.0.1',
		//
		//
		//
	};
	config.sessionConfig.store = new RedisStore({
		host:'localhost',
		port:'6379'
	});
}

config.mokshaAuth = {};
config.mokshaAuth.url = 'http://www.mokshansit.com/login';
config.mokshaAuth.msg = {};
config.mokshaAuth.msg.wrongP = "Wrong Password";
config.mokshaAuth.msg.success = "success";
config.mokshaAuth.msg.invalidId = "Moksha ID does not exist";


module.exports = config;