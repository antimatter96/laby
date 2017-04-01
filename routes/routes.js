var express = require('express');
var request = require('request');
var path = require('path');
var csrf = require('csurf');

var dbQueries = require('../db/queries');
var config = require('../config');

var router = express.Router();
var mokAuth = config.mokshaAuth;

var leaderboard;
var QA = require('../questions');

var csrfProtection = csrf({ cookie: false });

function rateLimmiter(req,res,next){
	if(req.session.lastAttempt && Date.now() - req.session.lastAttempt < 5000){
		res.sendStatus(429);
	}
	else{
		next();
	}
}

function ensureLoggedIn(req, res, next){
	if(req.session && req.session.teamId){
		next();
	}
	else{
		res.redirect('/login?authNeeded=true');
	}
}

router.get('/', csrfProtection,function(req, res) {
	if(req.session&&req.session.teamId){
		res.redirect('/rules');
	}
	else{
		var afterSignup = req.query.afterSignup || false;
		res.render('index.njk',{csrfToken : req.csrfToken(), afterSignup:afterSignup});
	}
});


router.get('/login',csrfProtection,function(req,res){
	if(req.query.afterSignup === "true"){
		res.render('login.njk',{csrfToken : req.csrfToken(), modalAlert:"Registered", modalAlertLevel: "bad"});
	}
	else if(req.query.authNeeded === "true"){
		res.render('login.njk',{csrfToken : req.csrfToken(), modalAlert:"You need to sign in", modalAlertLevel: "good"});
	}
	else{
		res.render('login.njk',{csrfToken : req.csrfToken()});
	}
});

router.get('/register',csrfProtection,function(req,res){
	res.render('register.njk',{csrfToken : req.csrfToken()});
});

router.get('/logout',logoutHandler);

router.post('/logout',logoutHandler);

function logoutHandler(req,res){
	req.session.destroy(function(err) {
		if(err){
			req.session.teamId = undefined;
			req.session.level = undefined;
			req.session.teamName = undefined;
		}
		res.status(200);
		res.format({
			html: function () {
				res.redirect('/');
			},
			json: function () {
				res.json({ msg: 'Logged Out' });
			},
			default: function () {
				res.type('txt').send('Logged Out');
			}
		});
	});
}

router.post('/login',csrfProtection,function(req,res){
	if(!req.body.moksha_id || !req.body.password){
		res.render('login.njk', {loginError : "Form Tampered With (- _ -)", csrfToken : req.csrfToken()});
	}
	else{
		var moksha_id = req.body.moksha_id;
		var pass = req.body.password;
		var options = {
			method: 'POST',
			url: mokAuth.url,
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			timeout: 1000000,
			form: { moksha_id: moksha_id, pass: pass } 
		};
		request(options, function (error, response, body) {
			if (error){
				res.sendStatus(500);
				console.error(error);
			}
			else{
				body = JSON.parse(body);
				if(body.msg === mokAuth.msg.success ){
					dbQueries.getTeamName(body.user.moksha_id).asCallback(function(err,rows){
						if(err){
							res.sendStatus(500);
							console.error(err);
						}
						else{
							if(rows.length!=0){
								req.session.teamId = rows[0]._id;
								req.session.level = rows[0].level;
								req.session.teamName = rows[0].name;
								req.session.attempts = 0;
								res.redirect('/rules');
								console.log(body.user.moksha_id + " ==> Team Name : " + rows[0].name +" ==> " + body.user.firstName + " ==> " + body.user.phone_no + " ==> " + body.user.email);
							}
							else{
								res.render('login.njk',{loginError:"No team registered to login with this Moksha ID",csrfToken : req.csrfToken()});
							}
						}
					});
				}
				else if(body.msg === mokAuth.msg.wrongP ){
					res.render('login.njk',{loginError:"Wrong Password" ,csrfToken : req.csrfToken()});
				}
				else{
					res.render('login.njk',{loginError:"Moksha ID Not Found" ,csrfToken : req.csrfToken()});
				}
			}
		});
	}
});

router.post('/register', csrfProtection, function(req, res){
	if(req.session&&req.session.teamId){
		res.redirect('/play');
	}
	else{
		if(!req.body.team_name || !req.body.moksha_id || !req.body.password){
			res.render('register.njk', {signupError : "Form Tampered With (- _ -)", csrfToken : req.csrfToken()});
		}
		else{			
			var body = req.body;
			//Check if all are unique
			if( body.sec_moksha_id && (body.moksha_id == body.sec_moksha_id)){
				res.render('register.njk',{signupError:"Please Give Unique Ids" ,csrfToken : req.csrfToken()});
			}
			else if( body.third_moksha_id && (body.moksha_id == body.third_moksha_id)){
				res.render('register.njk',{signupError:"Please Give Unique Ids" ,csrfToken : req.csrfToken()});
			}
			else if( body.third_moksha_id && body.sec_moksha_id && (body.third_moksha_id == body.sec_moksha_id)){
				res.render('register.njk',{signupError:"Please Give Unique Ids" ,csrfToken : req.csrfToken()});
			}
			else{
				var id1 = body.moksha_id;
				var id2 = body.sec_moksha_id;
				var id3 = body.third_moksha_id;
				var teamName = body.team_name;
				//If user has filled only third not second then make second as third
				if( body.third_moksha_id && !body.sec_moksha_id){
					id2 = id3;
					id3 = undefined;
				}
				var options = {
					method: 'POST',
					url: mokAuth.url,
					headers: { 'content-type': 'application/x-www-form-urlencoded' },
					timeout: 1000000,
					form: { moksha_id: id1, pass: body.password } 
				};
				request(options, function (error, response, res_body){
					if(error){
						res.sendStatus(500);
						console.log(error);
					}
					else{
						res_body = JSON.parse(res_body);
						//console.log(res_body);
						if(res_body.msg === mokAuth.msg.invalidId){
							res.render('register.njk',{signupError:"Please check Moksha Id (1st)" ,csrfToken : req.csrfToken()});
						}
						else if(res_body.msg === mokAuth.msg.wrongP){
							res.render('register.njk',{signupError:"Wrong Password" ,csrfToken : req.csrfToken()});
						}
						else{
							if(id2){
								var options2 = {
									method: 'POST',
									url: mokAuth.url,
									headers: { 'content-type': 'application/x-www-form-urlencoded' },
									timeout: 1000000,
									form: { moksha_id: id2, pass: "" } 
								};
								request(options2, function (error, response, res_body2){
									if(error){
										res.sendStatus(500);
										console.log(error);
									}
									else{
										res_body2 = JSON.parse(res_body2);
										//console.log(res_body2);
										if(res_body2.msg === mokAuth.msg.invalidId){
											res.render('register.njk',{signupError:"Please check Moksha Id (2nd)" ,csrfToken : req.csrfToken()});
										}
										else{
											if( id3 ){
												var options3 = {
													method: 'POST',
													url: mokAuth.url,
													headers: { 'content-type': 'application/x-www-form-urlencoded' },
													timeout: 1000000,
													form: { moksha_id: id3, pass: "" } 
												};
												request(options3, function (error, response, res_body3){
													if(error){
														res.sendStatus(500);
														console.log(error);
													}
													else{
														res_body3 = JSON.parse(res_body3);
														//console.log(res_body3);
														if(res_body3.msg === mokAuth.msg.invalidId){
															res.render('register.njk',{signupError:"Please check Moksha Id (3rd)" ,csrfToken : req.csrfToken()});
														}
														else{
															//3 members
															res.send("Only 3 member");
															dbQueries.isPart(id1,id2).asCallback(function(err,rows){
																if(err){
																	res.sendStatus(500);
																	console.error(err);
																}
																else{
																	if(rows.length != 0){
																		res.render('register.njk',{signupError:"Member(s) Registered with team :" + rows[0].name ,csrfToken : req.csrfToken()});
																	}
																	else{
																		dbQueries.isTeamNameTaken(teamName).asCallback(function(err,rows){
																			if(err){
																				res.sendStatus(500);
																				console.error(err);
																			}
																			else{
																				if(rows[0]['count(`name`)'] != 0){
																					res.render('register.njk',{signupError:"Team Name Taken" ,csrfToken : req.csrfToken()});
																				}
																				else{
																					dbQueries.createTeam(teamName,id1,id2).asCallback(function(err,rows){
																						if(err){
																							res.sendStatus(500);
																							console.error(err);
																						}
																						else{
																							res.redirect('/login?afterSignup=true');
																						}
																					});
																				}
																			}
																		});
																	}
																}
															});
														}
													}
												});
											}
											else{
												dbQueries.isPart(id1,id2).asCallback(function(err,rows){
													if(err){
														res.sendStatus(500);
														console.error(err);
													}
													else{
														if(rows.length != 0){
															res.render('register.njk',{signupError:"Member(s) Registered with team :" + rows[0].name ,csrfToken : req.csrfToken()});
														}
														else{
															dbQueries.isTeamNameTaken(teamName).asCallback(function(err,rows){
																if(err){
																	res.sendStatus(500);
																	console.error(err);
																}
																else{
																	if(rows[0]['count(`name`)'] != 0){
																		res.render('register.njk',{signupError:"Team Name Taken" ,csrfToken : req.csrfToken()});
																	}
																	else{
																		dbQueries.createTeam(teamName,id1,id2).asCallback(function(err,rows){
																			if(err){
																				res.sendStatus(500);
																				console.error(err);
																			}
																			else{
																				res.redirect('/login?afterSignup=true');
																			}
																		});
																	}
																}
															});
														}
													}
												});
											}
										}
									}
								});
							}
							else{
								dbQueries.isPart(id1).asCallback(function(err,rows){
									if(err){
										res.sendStatus(500);
										console.error(err);
									}
									else{
										if(rows.length != 0){
											res.render('register.njk',{signupError:"Member(s) Registered with team :" + rows[0].name ,csrfToken : req.csrfToken()});
										}
										else{
											dbQueries.isTeamNameTaken(teamName).asCallback(function(err,rows){
												if(err){
													res.sendStatus(500);
													console.error(err);
												}
												else{
													if(rows[0]['count(`name`)'] != 0){
														res.render('register.njk',{signupError:"Team Name Taken" ,csrfToken : req.csrfToken()});
													}
													else{
														dbQueries.createTeam(teamName,id1).asCallback(function(err,rows){
															if(err){
																res.sendStatus(500);
																console.error(err);
															}
															else{
																res.redirect('/login?afterSignup=true');
															}
														});
													}
												}
											});
										}
									}
								});
							}
						}
					}
				});
			}
		}
	}
});

router.get('/rules',function(req,res){
	res.sendFile( path.resolve(__dirname ,'../views/rules.html'));
});

router.get('/play',ensureLoggedIn,csrfProtection, function(req,res){
	if(!req.session.attempts){
		req.session.attempts = 0;
	}
	if(req.session.level > 14){
		res.sendFile( path.resolve(__dirname ,'../views/complete.html'));
	}
	else{
		dbQueries.getLevel(req.session.teamId).asCallback(function(err,rows){
			if(err){
				res.sendStatus(500);
				console.log(err);
			}
			else{
				var level = rows[0].level;
				req.session.level = level;
				res.render('play.njk', {q : QA[level], level: level , csrfToken : req.csrfToken()});
			}
		});
	}
});

router.post('/play',csrfProtection,ensureLoggedIn,function(req,res){
	if(!req.session.attempts){
		req.session.attempts = 1;
	}
	if(!req.body.attemptAnswer){
		res.render('play.njk', {q : QA[level],level: level, error : "Form Tampered With (- _ -)", csrfToken : req.csrfToken()});
	}
	else if(req.body.attemptAnswer > 250){
		res.render('play.njk', {q : QA[level],level: level, error : "Too long (-____-)", csrfToken : req.csrfToken()});
	}
	else{
		var teamId = req.session.teamId;
		var level = req.session.level; 
		var attemptAnswer = req.body.attemptAnswer;
		console.log(req.session.teamId + " ==> " + req.session.level + " ==> " + red.body.attemptAnswer)
		if(isCorrect(level, attemptAnswer)){
			level = req.session.level;
			req.session.attempts = 0;
			//req.session.lastAttempt = undefined;
			dbQueries.getLevel(teamId).asCallback(function(err,rows){
				if(err){
					res.sendStatus(500);
					console.log(err);
				}
				else{
					if(rows[0].level > level){
						req.session.level = rows[0].level;
						level = req.session.level;
						res.render('play.njk', {q : QA[level], level: level, error : "(－‸ლ)", csrfToken : req.csrfToken()});
					}
					else{
						dbQueries.updateLevel(teamId).asCallback(function(err,rows){
							if(err){
								res.sendStatus(500);
								console.error(err);
							}
							else{
								req.session.level = level + 1;
								req.session.attempts = 0;
								req.session.lastAttempt = undefined;
								res.redirect('/play');
								dbQueries.addCorrect(req.session.teamId, level, attemptAnswer).asCallback(function(err,rows){
									if(err){
										console.error(err);
									}
								});
							}
						});
					}
				}
			});
						
		}
		else{
			req.session.attempts++;
			req.session.lastAttempt = Date.now();
			dbQueries.addAttempt(teamId, level, attemptAnswer).asCallback(function(err,rows){
				if(err){
					res.sendStatus(500);
					console.error(err);
				}
				else{
					var level = req.session.level;	
					res.render('play.njk', {q : QA[level], level: level, error : "Wrong Answer", csrfToken : req.csrfToken()});
				}
			});
		}
	}
});

router.get('/leaderboard',function(req,res){
	res.render('leaderboard.njk',{ leaderboard:leaderboard });
});

router.get('/leaderboardUpdate',function(req,res){
	if(req.get('X-Appengine-Cron') === "true"){
		updateLeaderBoard();
		//console.log("Updating");
		res.sendStatus(200);
	}
	else if(req.get('X-update-cron') === "9810900377"){
		updateLeaderBoard();
		console.log("Updating Manual");
		res.sendStatus(200);
	}
	else{
		res.sendStatus(401);
	}
});

function updateLeaderBoard(){
	dbQueries.getLeaderBoard().asCallback(function(err,rows){
		if(err){
			console.error(err);
			return;
		}
		else{
			leaderboard = rows;
			return;
		}
	});
}

router.get('/loaderio-85c8963f9bd52fd8a66d2dcbc04891b0',function(req,res){
	res.sendFile( path.resolve( __dirname ,'../public/loaderio-85c8963f9bd52fd8a66d2dcbc04891b0.txt'));
});

function isCorrect(level, attemptAnswer){
	var answers = QA[level].answers;
	attemptAnswer = attemptAnswer.toLowerCase();
	if(answers.indexOf(attemptAnswer) > -1){
		return true;
	}
	else{
		return false;
	}
}

module.exports = router;