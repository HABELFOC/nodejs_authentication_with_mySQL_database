// const user         = require('../models/users.js');
// const mongoose     = require('mongoose');
// mongoose.Promise   = global.Promise;
const expressValidator= require('express-validator');
const passport        = require('passport');

// Setup Bcrypt
const bcrypt          = require('bcrypt');
const saltRounds      = 10;

	module.exports = function(app){

		// Home Page
		app.get('/', function(req, res, next){
			console.log(req.user);
			console.log(req.isAuthenticated());;
			const msg = {
				title: 'Node Authentication'
			};
			res.render('index', {msg: msg});
		});


		/* Logout */
		app.get('/logout', function(req, res, next){
			req.logout();
			req.session.destroy();
			res.redirect('/');
		});

		// Profile Page
		app.get('/profile', authenticationMiddleware(), function(req, res, next){
			res.render('profile');
		});

		// Register Page
		app.get('/register', function(req, res, next){
			const msg = {
				title: 'Registration',
				className: 'alert alert-info'
			};	
			res.render('register', {msg: msg});
		});

		// Login Page
		app.get('/login', function(req, res, next){
			const msg = {
				title: 'Please Login',
				className: 'alert alert-info'
			};
			res.render('login', {msg: msg});
		});

		// Add user
		app.post('/add/user', function(req, res, next){

			// Express Validator
			// req.checkBody('postparam', 'Invalid postparam').notEmpty().isInt();
	  		// req.checkParams('urlparam', 'Invalid urlparam').isAlpha();
	  		// req.checkQuery('getparam', 'Invalid getparam').isInt();

	  		// Validate Body Request
	  		req.checkBody('user_username', 'Username is require.').notEmpty();
	  		req.checkBody('user_email', 'Email is require.').notEmpty();
	  		req.checkBody('user_password', 'Password is require.').notEmpty();
	  		req.checkBody('user_confirm_password', 'Re-Enter password is require.').notEmpty();

			req.checkBody('user_username', 'Username must be between 4-15 characters long.').len(4, 15);
			req.checkBody('user_email', 'The email you entered is invalid, please try again.').isEmail();
			req.checkBody('user_email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
			req.checkBody('user_password', 'Password must be between 8-100 characters long.').len(8, 100);
			// req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
			req.checkBody('user_confirm_password', 'Re-Enter password must be between 8-100 characters long.').len(8, 100);
			req.checkBody('user_confirm_password', 'Passwords do not match, please try again.').equals(req.body.user_password);

			// Get Body Value
			const username = req.body.user_username;
			const email = req.body.user_email;
			const password = req.body.user_password;

	  		req.getValidationResult().then(function(result){
	  			if (result.isEmpty() === false){
	  				// console.log(result.isEmpty());
	  				// console.log(result.array());
	  				const errors = result.array();

	  				const msgError = {
		  				title: 'Registration Error',
		  				className: 'alert alert-danger',
		  				errors: errors
	  				};
	  				res.render('register', {msg: msgError});
	  			}else{
	  				// console.log(result.isEmpty());
	  				// console.log(result.array());
	  				const db = require('../models/users.js');
	  				// Hash Password
					bcrypt.hash(password, saltRounds, function(err, hash) {
						if (err) throw err;
						// Querying To Database
						db.query('INSERT INTO users (username, email, password) VALUES (?,?,?)', [username,email,hash], function(err, result, fields){
							if (err) throw err;
							/*const msgSuccess = {
								title: 'Registration Complete!',
								className: 'alert alert-info'
								};*/
							db.query('SELECT LAST_INSERT_ID() as `user_id`', function(error, results, fields){
								if (error) throw error;
								let user_id = results[0];
								// console.log(results);
								let id_string = user_id.toString();
								let success_msg = ['Registration Complete',id_string];

								req.login(user_id, function(err){
									if (err) throw err;
									res.redirect('/?success='+success_msg.join('&'));
								});
							});
						});
					});
					
	  			}

	  		});

		});

		// User Login
		app.post('/user/login', checkfields(), passport.authenticate('local', {
			failureRedirect: '/login'
		}), function(req, res, next){
			res.redirect('/');
		});

		// Passport init session
		passport.serializeUser(function(user_id, done) {
		  done(null, user_id);
		});
		 
		passport.deserializeUser(function(user_id, done) {
		    done(null, user_id);
		});

		// Restrict Page Access Middleware
		function authenticationMiddleware () {  
			return (req, res, next) => {
				console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

			    if (req.isAuthenticated()) return next();
			    let msg_login = {
			    	title: 'Please Login',
			    	className: 'alert alert-danger'
			    };
			    res.render('login', {msg: msg_login});
			}
		}    

		// Check fields function
		function checkfields(){
			return (req, res, next) => {
				req.checkBody('username', 'Username is require').notEmpty();
				req.checkBody('password', 'Password is require').notEmpty();

				req.getValidationResult().then(function(result){
					if (result.isEmpty() === false){
						// console.log(result);
						console.log(result.isEmpty());
						console.log(result.array());
						const errors = result.array();

	  					/*const msg_1 = {
		  				title: 'Login Error',
		  				className: 'alert alert-danger',
		  				errors: errors
	  				};*/
	  				let errors_msg = [];
	  				errors.forEach(function(data){
	  					let match = /\s/g;
	  					errors_msg.push(data.msg.replace(match, '_'));
	  				});
	  				console.log(errors_msg);
	  				res.redirect('/login?errors='+errors_msg.join('&'));
					}else{
						return next();
					}
				});

			}
		}
	};

