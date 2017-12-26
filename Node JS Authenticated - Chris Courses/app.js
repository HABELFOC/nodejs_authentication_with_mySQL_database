const express          = require('express');
// const mongoose      = require('mongoose');
const bodyParser       = require('body-parser');
const expressValidator = require('express-validator');
const app              = express();
const routes           = require('./routes/router.js');

// Authentication Packages
const session          = require('express-session');
const passport         = require('passport');
const LocalStrategy    = require('passport-local').Strategy;
const MySQLStore       = require('express-mysql-session')(session);
const bcrypt           = require('bcrypt');

require('dotenv').config();

/*// Connect to mongodb & listen connection
const promise = mongoose.connect('mongodb://127.0.0.1:27017/mDB', {
	useMongoClient: true,
});

mongoose.connection.once('open', function(){
	console.log('connected to the database!!');
}).on('error', function(err){
	console.log('Error found: ', err);
});

promise.then(function(db){
	console.log(db);
})*/



// Setup view engine
app.set('view engine', 'hbs');

// Setup Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

// Setup Static files
app.use(express.static('./public'));

// mysql-session
const options = {
    host    : process.env.DB_HOST,
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};


const sessionStore = new MySQLStore(options);

// Setup express-session
app.use(session({
  secret           : 'xcizcxooizocziozpp',
  resave           : false,
  store            : sessionStore,
  saveUninitialized: false
  // cookie        : { secure: true }
}));

// Setup passport
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    const db = require('./models/users.js');

    db.query('SELECT id, password FROM users WHERE username = ?', [username], function(errors, results, fields){
        if (errors) {done(errors)};
        console.log(results);
        const hashed_pwd = results[0].password;
        const user_id = results[0].id;

        if (results.length === 0){
              done(null, false);
        }else{
          bcrypt.compare(password, hashed_pwd, function(err, response){
              if(response === true){
                  done(null, user_id);
              }else{
                  return done(null, false);
              }
          });
        }
    });
  }
));


/* Show/Unshow Navbar Button of login/logout /Dynamic Header */
app.use(function(req, res, next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

// Initilize routes & fire routes
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development.isAuthenticated = req.isAuthenticate()
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Handlebars default config
const hbs = require('hbs');
const fs = require('fs');

const partialsDir = __dirname + '/views/partials';

const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  const matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  const name = matches[1];
  const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
});

app.listen(process.env.port || 3000, function(){
	console.log('Listening on port 3000...');
})
