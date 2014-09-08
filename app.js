//..................initialize required modules
var express = require('express'); 
//var connect = require('connect'); //ALTERNATIVE HTTP SERVER FRAMEWORK TO EXPRESS
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');
var errorhandler = require('errorhandler');
var mongoose = require('mongoose');

//var Router = require('routes'); //MAY NOT NEED THIS? documentation: https://github.com/aaronblohowiak/routes.js


//var _HAM = require('./HAM.js');//external script if needed


var app=express();
var http=require('http');


//configure express as a typical web server // UPDATED FOR CONNECT
//redirect to html
app.get("/", function(req, res) { //get method is specific to express, not connect
  res.redirect("/sandbox.html");
});

//use middleware for http server framework
//add detail
app.use(methodOverride());

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use(serveStatic(process.cwd()+'/scripts'));
var serve = serveStatic('public', {'sandbox':['sandbox.html']});

app.use(errorhandler({
	dumpExceptions: true,
	showStack: true
}));

//make a little server that serves contents of 'public'
var server = http.createServer(function(req,res){
	var done = finalhandler(req, res);
	serve(req, res, done);
});

//listen for visitors
server.listen(process.env.PORT || 6789);


//................................Socket.io
//initialize socket.io to listen to the same server as express
var io = require('socket.io').listen(server);
io.set('log level', 1);    //reduce the amount of debugging output written to the console



//list of online users
var users={};

//current color
var color="#000000";       
//a dummy counter used in order to generate incremental unique user ids
var count=1;  


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//MONGO DB
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//.....................................................MongoDB
/*var mongo = require('mongodb'),
	  MongoServer = mongo.Server,
	  Db = mongo.Db,
	  ObjectID = mongo.ObjectID;*/

//.................open a connection to the mongodb server
var server = process.env.MONGOLAB_URI || 'mongodb://localhost/my_database';
var port = process.env.PORT || 27017;
//var mdbserver = new MongoServer(server, port, {auto_reconnect: true});//27017
//.................ask the server for the database named "DBASE" this databse will be created if it doesn't exist already
mongoose.connect(server, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + server + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + server);
  }
});

var Art = mongoose.model('Art', {created: Date, url: String});
//var now = //_now.getFullYear()+"_"+(_now.getMonth()+1)+"_"+_now.getDate()+"_"+_now.getHours()+"_"+_now.getMinutes();
/*var n = "artDB"
var db = new Db(n, mdbserver,{safe:true});
console.log("using db "+n);

//.................get or create a collection in cubeDB to store objects
//global variable that will be set to the object collection as soon as it is created or returned from the database
var HAM = null;

//.................open the database
db.open(function(err, db) {
  if(!err) {
  	//if all went well [that is mongoDB is alive and listening]
    console.log("We are connected to mongoDB");

    OpenCollections();
    
  }
});*/




function OpenCollections()
{

    //create a collection named bookcollection and if it succeeds set the global variable bookcollection to 
    //point to the newly created or opened collection
    db.createCollection(
    	'HAM', 				//name of collection to open
    	{safe:false}, 					//unsafe mode, if the collection already exists just give us the existing one
    	function(err, collection) {		//this function is called as soon as the databse has either found or created a collection with the requested name
    		HAM=collection;	//set the global variable bookcollection to the newly found collection
    		//mongoDBTest();			//run the mongoDB function defined below [this is where we do all our testing]
    		
    		//PopulateHAM();
    		//DB_REFERERNCE();	
    		HAM.ensureIndex({created: -1}, function(err) {
    		
    		});
    	});
}

function PopulateHAM()
{
	//HAM.remove(); //Clean Collection, removes all documents

	var empty = {};

	HAM.insert(
		empty,
		function(err, result)
		{
			if(!err) console.log("populated HAM");
		});
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SOCKET IO
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//each time we receive a connection from the user this callback function is executed
//the socket parameter is the newly created socket object that encapsulates the new connection
//there is one socket object for each connected user
io.sockets.on('connection', function (socket) {
	
	//attach a custom user object to the socket
	socket.user={"sharedData":{}};
	socket.user.id= ""+count;	//assign a unique id to the user

	socket.user.socket=socket;	//assign the socket to hte user so that each user knows her connection conduit	
	users[socket.user.id]=socket.user; //register the new user to the list of users
	socket.user.sharedData.id = socket.user.id;

	//socket.emit('_GetHAMyrLng', __HAMyrLng); //may exceed max packet size?

	//this event is automatically fired when a user dsconnects
	socket.on('disconnect', function () {
		//socket.emit('Bye', {"bye":"bye"});
		//SaveEdit("UserLeft", {"id":socket.user.id, "ci":socket.user.ci, "s_id":socket.id});	//notify all other users that this socket's user left
		delete users[socket.user.id];    //delete the user from the list
	});

		
	//socket test
	socket.on('test', function(_data){
		var data = {};
		data.ok="great";
		socket.emit('_test', data);
	});

	socket.on('add-item', function(data) {
		console.dir(data);
		var art = new Art({url: data.url, created: new Date()});
		art.save();
		//data.created = new Date();
		//HAM.insert(data);
		socket.emit('updated-db', data);
	});
	
	socket.on('get-items', function(data) {
		console.log("GET ITEMS");
		Art.find().sort({created: -1}).limit(10).toArray(function(err, results) {
			console.log("results");
			socket.emit('send-items', results);
		});
		
	});
	
});




