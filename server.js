var express = require('express');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var validator = require('validator');
var morgan = require('morgan');
var path = require('path');

var favicon = require('serve-favicon');

var config = require('./config');

if(process.env.PRO == 1){
	require('@google-cloud/debug-agent').start({ allowExpressions: true });
}

// 
//=================================================

var app = express();

app.use(favicon(__dirname + '/public/favicon.ico'));
app.set('views', __dirname + '/views');
app.use('/static', express.static('public',{
	maxage:'5h'
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('port', process.env.PORT || 8080);

// TEMPLATING
//=================================================

var nunjucksConfig = config.nunjucks;
nunjucksConfig.express = app;
nunjucks.configure(app.get('views'), nunjucksConfig);

// SESSION
//================================================

var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var sessionConfig = config.sessionConfig;
app.use(session(sessionConfig));

// SECURITY
//=================================================
app.use(function(req, res, next) {
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
	res.setHeader("X-powered-by", "none");
	next();
});

// Custom Middlewares
//==========================


// ROUTES
//===================================

var routes = require('./routes/routes');
app.use('/', routes);

// 
//=====================================

app.use(function(req, res, next){
	res.status(404);
	res.format({
		html: function () {
			res.sendFile( path.resolve( __dirname ,'./views/404.html'));
		},
		json: function () {
			res.json({ error: 'Not found' });
		},
		default: function () {
			res.type('txt').send('Not found');
		}
	});
});

app.use(function(err, req, res, next) {
	if (!err) {
		next();
	}
	else if (err.code === 'EBADCSRFTOKEN') {
		res.status(403);
		res.send("CSRF Token Expired OR FORM TAMPERED WITH");
		res.end();
	}
	else {
		next(err);
	}
});

app.use(function(err, req, res){
	console.log("err =>> ");
	console.log(err);
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

app.listen(app.get('port'), function() {
	console.log("Running on port " + app.get('port'));
});