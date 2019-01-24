

var http = require('http');
var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var path    = require("path");

console.log('Server running at http://127.0.0.1:8081/');

var __dirname = "D:/Indecomm/SQLite/SQLite-NodeJS";

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true })


var engine = require('consolidate');
app.engine('html', engine.mustache);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'html');

//app.use(express.static('public'));
//app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('./'));

app.get('/', function(req, res) {
   console.log("Got a GET request for the homepage");
    res.render('index.html');	

});

app.post('/', function (req, res) {
   console.log("Got a POST request for the homepage");
   res.send('Hello POST');
   //res.render('index.html');
});

app.get('/getAllUsers', urlencodedParser, function (req, res) {
		
	//let db = new sqlite3.Database('user.db');
	let db = new sqlite3.Database('user.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
	});

	db.serialize(() => {	 

		var dataList = "";

		//db.run("CREATE TABLE role (id INT, role_type TEXT)");

		//var stmt = db.prepare("INSERT INTO role VALUES (?,?)");
		//stmt.run(1, 'ADMIN');
		//stmt.run(2, 'USER');
		//stmt.finalize();

		db.each('SELECT id, name, email FROM USER ', (err, row) => {
			if (err) {
				console.error(err.message);
			}
			if(dataList != "")
			dataList = dataList + ',';
			dataList = dataList + '{"id":"' + row.ID + '","name":"' + row.NAME + '","email":"' + row.EMAIL + '"}';
			
		});

		//db.close();
		db.close((err) => {
			if (err) {
				console.log('ERROR in getAllUsers!');
				console.error(err.message);
			}
			var response = {'dataList':dataList};							
			res.render(__dirname + "/listAllUsers.html", response);

		});

	});
		 	
});


app.get('/showAddUserForm', function(req, res) {

	res.render(__dirname + '/showAddUserForm.html');

});

app.post('/addUser', urlencodedParser, function (req, res) {
		
	let db = new sqlite3.Database('user.db');

	db.serialize(() => {

		db.each("select (max(id)+1) as id from user", function(err, row) {
			console.log('row.id : ' + row.id);
			persist2DB(req, res, row.id);		
			
		});

		db.close();

	});

});

var persist2DB = function(req, res, maxId) {

	if(maxId == null || maxId == 'undefined')
		maxId = 1;

	let db = new sqlite3.Database('user.db');

	var stmt = db.prepare("INSERT INTO user VALUES (?,?,?)");
	stmt.run(maxId, req.body.name, req.body.email);
	stmt.finalize();

	db.close();

	res.redirect(303, '/getAllUsers');

};


app.get('/gotoEditUserForm', function(req, res){
    var id = req.query.id;
    console.log('query : ' + id);

	let db = new sqlite3.Database('user.db');

	db.serialize(() => {	 

		var userDataForEdit = "";

		db.each("select id, name, email from user where id=" + id, function(err, row) {
			if (err) {
				console.error(err.message);
			}

			userDataForEdit = userDataForEdit + '{"id":"' + row.ID + '","name":"' + row.NAME + '","email":"' + row.EMAIL + '"}';
			console.log('return to edit user page...');
			var response = {'userDataForEdit':userDataForEdit};
			res.render(__dirname + "/showEditUserForm.html", response);
		});

		db.close();

	});
	
});


app.post('/editUser', urlencodedParser, function (req, res) {
		
	let db = new sqlite3.Database('user.db');

	var stmt = db.prepare('update user set name=?, email=? where id=?');
	stmt.run(req.body.name, req.body.email, req.body.id);
	stmt.finalize();

	db.close();

	res.redirect(303, '/getAllUsers');
		 	
});


app.get('/gotoDeleteUserForm', function(req, res){
    var id = req.query.id;
    console.log('id from query to delete : ' + id);

	let db = new sqlite3.Database('user.db');

	var stmt = db.prepare('delete from user where id=?');
	stmt.run(id);
	stmt.finalize();

	db.close();

	res.redirect(303, '/getAllUsers');
	
});


app.listen(8081, '127.0.0.1');