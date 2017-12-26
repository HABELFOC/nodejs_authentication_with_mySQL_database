const mysql = require('mysql');

const conn = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

// Check connection
conn.connect(function(err){
	if (err) {
		console.log('Error: ', err);
	}else{
		console.log('Connected to mysql database!');
	}
});

module.exports = conn;


/*const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Setup mongoose schema
const mySchema = new Schema({
	first_name: {
		type: String,
		required: [true, 'field is required']
	},
	last_name: {
		type: String,
		required: [true, 'field is required']
	},
	username: {
		type: String,
		required: [true, 'field is required']
	},
	email: {
		type: String,
		required: [true, 'field is required']
	},
	password: {
		type: String,
		required: [true, 'field is required']
	}
});

// Setup mongoose model
const user = mongoose.model('user', mySchema);


module.exports = user;*/