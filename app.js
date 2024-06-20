var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const hbs = require("hbs");
var multer = require("multer");
const mysql = require("mysql2");
const db = require("./config/db");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const secretKey = crypto.randomBytes(64).toString("hex");
const flash = require("connect-flash");
var indexRouter = require("./routes/index");

var app = express();

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.use(
    session({
        secret: secretKey,
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(
    new LocalStrategy((username, password, done) => {
        db.query(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            [username, password],
            (err, results) => {
                if (err) return done(err);

                if (results.length > 0) {
                    return done(null, results[0]);
                } else {
                    return done(null, false, {
                        message: "Incorrect username or password",
                    });
                }
            }
        );
    })
);

// Passport session setup
passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
    db.query(
        "SELECT * FROM users WHERE user_id = ?",
        [id],
        (err, results) => {
            if (err) return done(err);

            if (results.length === 0) {
                return done(null, false);
            }

            db.query(
                "SELECT * FROM users u JOIN employee_master e ON e.employee_id = u.employee_id WHERE user_id = ?",
                [id],
                (err, userInfo) => {
                    if (err) return done(err);
                    console.log("Deserializing user:", userInfo[0]);
                    done(null, userInfo[0]);
                }
            );
        }
    );
});

// Middleware to pass user info to all views
app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.userInfo = req.user;
    } else {
        res.locals.userInfo = null;
    }
    next();
});

hbs.registerPartials(path.join(__dirname, "views/partials"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

app.use((req, res, next) => {
    req.db = db; // Attach the MySQL connection to the request object
    next();
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;