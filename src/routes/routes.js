var express = require("express");
var path = require("path");
var csrf = require("csurf");
var bcrypt = require("bcrypt");

var dbQueries;

var router = express.Router();

var leaderboard;
var QA = require("../../questions");

var csrfProtection = csrf({ cookie: false });

function rateLimmiter(req, res, next) {
  if (req.session.lastAttempt && Date.now() - req.session.lastAttempt < 5000) {
    res.sendStatus(429);
    return;
  }
  next();
}

function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    next();
    return;
  }
  res.redirect("/login?authNeeded=true");
}

function addCSRFToken(req, res, next) {
  res.locals.csrfToken =req.csrfToken();
  next();
}

//
router.get("/logout", logoutHandler);
router.post("/logout", logoutHandler);
router.get("/leaderboard", leaderboardGet);
router.get("/leaderboardUpdate", leaderboardUpdate);
router.get("/rules", rulesGet);

router.use(csrfProtection);
router.use(addCSRFToken);

router.get("/", mainGet);

router.get("/login", loginGet);
router.post("/login", loginPost);

router.get("/register", registerGet);
router.post("/register", registerPost);

router.get("/play", ensureLoggedIn, playGet);
router.post("/play", ensureLoggedIn, playPost);

//


async function mainGet(req, res) {
  if (req.session && req.session.userId) {
    res.redirect("/rules");
    return;
  }
  var afterSignup = req.query.afterSignup || false;
  res.render("index.njk", { afterSignup: afterSignup });
}

async function loginGet(req, res) {
  if (req.query.afterSignup === "true") {
    res.render("login.njk", { modalAlert: "Registered", modalAlertLevel: "bad" });
  } else if (req.query.authNeeded === "true") {
    res.render("login.njk", { modalAlert: "You need to sign in", modalAlertLevel: "good" });
  } else {
    res.render("login.njk");
  }
}

async function registerGet(req, res) {
  res.render("register.njk");
}

async function logoutHandler(req, res) {
  req.session.destroy(function (err) {
    if (err) {
      req.session.userId = undefined;
      req.session.level = undefined;
    }
    res.status(200);
    res.format({
      html: function () {
        res.redirect("/");
      },
      json: function () {
        res.json({ msg: "Logged Out" });
      },
      default: function () {
        res.type("txt").send("Logged Out");
      }
    });
  });
}

async function loginPost(req, res) {
  if (!req.body.username || !req.body.password) {
    res.render("login.njk", { loginError: "Form Tampered With (- _ -)" });
    return;
  }

  var username = req.body.moksha_id;
  var password = req.body.password;

  dbQueries.getUser(username).asCallback(function (err, rows) {
    if (err) {
      res.sendStatus(500);
      console.error(err);
      return;
    }

    if (rows.length == 0) {
      res.render("login.njk", { loginError: "No user with this username" });
      return;
    }

    bcrypt.compare(password, rows[0].password, function(err, same) {
      if (err) {
        res.sendStatus(500);
        console.error(err);
        return;
      }

      if (!same) {
        res.render("login.njk", { loginError: "No team registered to login with this Moksha ID" });
        return;
      }

      req.session.userId = rows[0]._id;
      req.session.level = rows[0].level;
      req.session.attempts = 0;
      res.redirect("/rules");
    });

  });
}

async function registerPost(req, res) {
  if (req.session && req.session.userId) {
    res.redirect("/play");
    return;
  }
  if (!req.body.username || !req.body.password) {
    res.render("register.njk", { signupError: "Form Tampered With (- _ -)" });
    return;
  }

  var username = req.body.username;
  var password = req.body.password;

  dbQueries.isPart(username).asCallback(function (err, rows) {
    if (err) {
      res.sendStatus(500);
      console.error(err);
      return;
    }

    if (rows.length != 0) {
      res.render("register.njk", { signupError: "Member Registered with team :" + rows[0].name });
      return;
    }

    bcrypt.hash(password, 10, function(err, enc) {
      if(err) {
        res.sendStatus(500);
        console.log(err);
        return;
      }

      dbQueries.createUser(username, enc).asCallback(function (err, rows) {
        if (err) {
          res.sendStatus(500);
          console.error(err);
          return;
        }
        
        res.redirect("/login?afterSignup=true");
      });
    });
  });

  
}

async function rulesGet(req, res) {
  res.sendFile(path.resolve(__dirname, "../views/rules.html"));
}

async function playGet(req, res) {
  if (!req.session.attempts) {
    req.session.attempts = 0;
  }

  if (req.session.level > 14) {
    res.sendFile(path.resolve(__dirname, "../views/complete.html"));
    return;
  }

  dbQueries.getLevel(req.session.userId).asCallback(function (err, rows) {
    if (err) {
      res.sendStatus(500);
      console.log(err);
      return;
    }
    var level = rows[0].level;
    req.session.level = level;
    res.render("play.njk", { q: QA[level], level: level });
  });
}

async function playPost(req, res) {
  var level = req.session.level;

  if (!req.session.attempts) {
    req.session.attempts = 1;
  }
  if (!req.body.attemptAnswer) {
    res.render("play.njk", { q: QA[level], level: level, error: "Form Tampered With (- _ -)" });
    return;
  }
  if (req.body.attemptAnswer > 250) {
    res.render("play.njk", { q: QA[level], level: level, error: "Too long (-____-)" });
    return;
  }

  var userId = req.session.userId;
  var attemptAnswer = req.body.attemptAnswer;

  console.log(req.session.userId + " ==> " + req.session.level + " ==> " + req.body.attemptAnswer);

  if (isCorrect(level, attemptAnswer)) {
    level = req.session.level;
    req.session.attempts = 0;
    //req.session.lastAttempt = undefined;
    dbQueries.getLevel(userId).asCallback(function (err, rows) {
      if (err) {
        res.sendStatus(500);
        console.log(err);
        return;
      }

      if (rows[0].level > level) {
        req.session.level = rows[0].level;
        level = req.session.level;
        res.render("play.njk", { q: QA[level], level: level, error: "(－‸ლ)" });
        return;
      }

      dbQueries.updateLevel(userId).asCallback(function (err, rows) {
        if (err) {
          res.sendStatus(500);
          console.error(err);
          return;
        }
        req.session.level = level + 1;
        req.session.attempts = 0;
        req.session.lastAttempt = undefined;
        res.redirect("/play");
        dbQueries.addCorrect(req.session.userId, level, attemptAnswer).asCallback(function (err, rows) {
          if (err) {
            console.error(err);
          }
        });
      });
    });
  } else {
    req.session.attempts++;
    req.session.lastAttempt = Date.now();
    dbQueries.addAttempt(userId, level, attemptAnswer).asCallback(function (err, rows) {
      if (err) {
        res.sendStatus(500);
        console.error(err);
        return;
      }
      res.render("play.njk", { q: QA[level], level: level, error: "Wrong Answer" });
    });
  }
}

async function leaderboardGet(req, res) {
  res.render("leaderboard.njk", { leaderboard: leaderboard });
}

async function leaderboardUpdate(req, res) {
  if (req.get("X-Appengine-Cron") === "true") {
    updateLeaderBoard();
    res.sendStatus(200);
  } else if (req.get("X-update-cron") === "9810900377") {
    updateLeaderBoard();
    console.log("Updating Manual");
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
}

function updateLeaderBoard() {
  dbQueries.getLeaderBoard().asCallback(function (err, rows) {
    if (err) {
      console.error(err);
      return;
    }
    leaderboard = rows;
  });
}

function isCorrect(level, attemptAnswer) {
  var answers = QA[level].answers;
  attemptAnswer = attemptAnswer.toLowerCase();
  if (answers.indexOf(attemptAnswer) > -1) {
    return true;
  }
  return false;
}

function init(config) {
  dbQueries = require("../db/queries").init(config.knexConfig);
  return router;
}

module.exports = init;
