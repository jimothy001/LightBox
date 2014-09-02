//..................initialize required modules
var express = require('express'); 
//var connect = require('connect'); //ALTERNATIVE HTTP SERVER FRAMEWORK TO EXPRESS
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');
var errorhandler = require('errorhandler');
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
/*
//.....................................................MongoDB
var mongo = require('mongodb'),
	  MongoServer = mongo.Server,
	  Db = mongo.Db,
	  ObjectID = mongo.ObjectID;

//.................open a connection to the mongodb server
var mdbserver = new MongoServer('localhost', 27017, {auto_reconnect: true});//27017
//.................ask the server for the database named "DBASE" this databse will be created if it doesn't exist already


//var now = //_now.getFullYear()+"_"+(_now.getMonth()+1)+"_"+_now.getDate()+"_"+_now.getHours()+"_"+_now.getMinutes();
var n = "bookDB"
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
});


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
    		
    		PopulateHAM();
    		//DB_REFERERNCE();		
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
*/


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
		socket.emit('_test', data);
	});



});













































	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//DB_REFERERNCE
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function DB_REFERERNCE() {
		//........................Find Queries
		//ARRAYS ARE USED FOR GROUPS OF RETURNED DB OBJECTS 

		//find all objects	
		bookcollection.find().toArray(function(_err, _docs) {
			console.log("find all:"); //find returns a cursor not the actual results. It basically returns an object through which you can retrieve the results in batches or all at once depending on bandwidth and memory limitations
			console.log(_docs.length);
		});

		
		//find All objects where year==1800
		bookcollection.find({year:1800}).toArray(function(_err, _docs) {
			console.log("find year 1800:"); 
			for(var i in _docs)
			{
				console.log(_docs[i].city);
			}
		});

		//find All objects where iso2=="CH" and lang==fr
		bookcollection.find({iso2:"CH", lang:"fr"}).toArray(function(_err, _docs) {
			console.log("find iso2 CH - lang fr:"); 
			for(var i in _docs)
			{
				console.log("edition: "+_docs[i].edition);
			}
		});

		//find A SINGLE object where firstname=="Ingrid"
		bookcollection.findOne({firstname:"Ingrid"},function(_err, _doc) {
			console.log("find one - Ingrid"); 
			console.log(_doc);
		});

		//.......................find , conditional operators

		//find All objects where num>=60
		bookcollection.find({num:{"$gte":60}}).toArray(function(_err, _docs) {
			console.log("find num greater than 60:"); 
			console.log(_docs.length);
		});

		//find All objects where num>=60 and num<=100
		bookcollection.find({num:{"$gte":60, "$lte":100}}).toArray(function(_err, _docs) {
			console.log("find num between 60 and 100:"); 
			console.log(_docs.length);
		});

		//find All objects where DOB>=startDate and DOB<=endDate
		var startDate=new Date(1950, 1, 1);
		var endDate=new Date(1998, 1, 1);
		bookcollection.find({DOB:{"$gte":startDate, "$lte":endDate}}).toArray(function(_err, _docs) {
			console.log("find date between 1950 and 1998:"); 
			console.log(_docs.length);
		});


		//find All objects where num is ANY of the numbers in [54, 89, 5]
		bookcollection.find({num:{"$in":[54, 89, 5]}}).toArray(function(_err, _docs) {
			console.log("find num if equal to 54 or 89 or 5"); 
			console.log(_docs.length);
		});


		//find All objects where num is NOT ANY of the numbers in [54, 89, 5]
		bookcollection.find({num:{"$nin":[54, 89, 5]}}).toArray(function(_err, _docs) {
			console.log("find num if not equal to 54 or 89 or 5"); 
			console.log(_docs.length);
		});

		//find All objects where num==54 OR data.a==40
		bookcollection.find(	{"$or": [
									{"num":54},
									{"data.a":40}
									]
							}
			).
		toArray(function(_err, _docs) {
			console.log("find num equal to 54 or data.a equal to 40"); 
			console.log(_docs.length);
		});


		//find All objects that contian the word "bye" in their array member "posts"
		bookcollection.find({"posts": "bye"}, {firstname:1}).toArray(function(_err, _docs) {
			console.log("find people who posted the word bye"); 
			console.log(_docs);
		});

		//find All objects that contian the word "bye" AND the word "hey" in their array member "posts"
		bookcollection.find({"posts": {"$all": ["bye", "hey"]}}, {firstname:1}).toArray(function(_err, _docs) {
			console.log("find people who posted the word bye and hey"); 
			console.log(_docs);
		});


		//.............................Cursors
		//find all objects but return a cursor object. The cursor des not contian the reult it just knows how to retrieve them sequentially 
		var cursor=bookcollection.find();

		console.log("find all using cursor iteration:"); 

		//execute a function for each result in the query. You can use it to filter or process results one by one
		cursor.each(function(err, item) {
			if (item==null) {
				console.log("cursor end");
			}
			else {
				console.log("cursor.next");
				console.log(item.firstname);
			}
		});


		//skip, limit, sort
		//.......................find-sort

		//find all objects and return an array SORTED by DOB
		bookcollection.find().sort({"DOB":1}).toArray(function(_err, _docs) {
			console.log("find all sort by DOB:");
			console.log(_docs);
		});


		//.......................regular expressions //searching for text patterns
		//find all objects whose firstname matches a particular text pattern
		//bookcollection.find({"firstname": /h.*/i}, {firstname:1}).toArray(function(_err, _docs) {
		//	console.log("find names starting with h or H, print only the names"); 
		//	console.log(_docs);
		//});


		//........................Updates

		//replace all documents where the first name is "Liv" with a completely new document
		bookcollection.update({"firstname": "Liv"}, {firstname:"Liv2", secondname:"Ullmann", num:24, DOB:new Date(1914, 8, 16), posts:[], friends:[]});
		setTimeout(function() {
			bookcollection.findOne({firstname:"Liv2"},function(_err, _doc) {
				console.log("full document replace:"); 
				console.log(_doc);
			});
		}, 1000);


		//change specific fields in documents
		//change the DOB of Erlang
		bookcollection.update({"firstname": "Erland"}, {"$set": {DOB:new Date(2008, 8, 16)}});
		//Delete the field "friends" from Erlang
		bookcollection.update({"firstname": "Erland"}, {"$unset": {friends:1}});
		//increment the num field by 1000 for Erlang
		bookcollection.update({"firstname": "Erland"}, {"$inc": {num:1000}});
		//Add an element to the array of elements "posts" in Erlang
		bookcollection.update({"firstname": "Erland"}, {"$push": {posts:"this is a post 0"}});
		bookcollection.update({"firstname": "Erland"}, {"$push": {posts:"this is a post 1"}});
		bookcollection.update({"firstname": "Erland"}, {"$push": {posts:"this is a post 2"}});
		//remove the last element added to the array "posts" in Erlang
		bookcollection.update({"firstname": "Erland"}, {"$pop": {posts:1}}); 
		

		//wait for the changes to take effect and find Erlang to see the changes
		setTimeout(function() {
			bookcollection.findOne({firstname:"Erland"},function(_err, _doc) {
				console.log("change specific fields:"); 
				console.log(_doc);
			});
		}, 1000);

	}
