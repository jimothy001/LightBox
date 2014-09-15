//testing!!!
	var yrY;


	var socket = io.connect(); //socket.io initialization and creation of the socket object at beginning of script
	//the queue is used in order to queue events so that they don't fire rapidly but only at set intervals.
	//this technique can be used for less critical events and they could bebatched and uploaded as a package to 
	//avoid overwhelming the server
	var queue={};


//declare some global variables here
//these are variables that you want to be able to see and manipulate from any point in your program
//from within any function or other code block
var centraldiv=null;
var waiting=false;
var waitdiv=null;
var canvas=null;
var graph=null;

//the main function is called as soon as the document loads
//so this is the starting point of our application
function Main() {	

	//get the canvas element from the DOM (see index.html)
	canvas=document.getElementById("bgcanvas");
	//extract the canvas graphics context. graph will contain the functions that allow us to perform basic drawing on the canvas
	graph=canvas.getContext('2d');

	//get a reference to the div with id="central" from the DOM (see index.html)
	centraldiv=document.getElementById("central");

	//define the function to execute when the user presses the mouse while over the cantraldiv
	//e is an object constructed by the system when the mouse is pressed
	//it contains usefull information such as the location and context of the mous as well as which button was pressed
	centraldiv.onmousedown=function(e) {
		//transform mouse coordinates in e to longitude and latitude coordinates
		var geo=getGeoFromMouse(e);
		//get the weather data at location geo and execute onGotWeatherData as soon as you receive the server response
		getWeatherData(geo, onGotWeatherData);
	};

	//here we create a dummy grey div that we hide initially. This div
	//will appear whn the user clicks and remain visible while waiting for server data
	waitdiv=document.createElement("div");
	waitdiv.className="wait";
	waitdiv.style.visibility="hidden";
	centraldiv.appendChild(waitdiv);


	//create the div that contains the longitude coordinate and follows the mouse cursor at the top of the page
	var lonlabel=document.createElement("div");
	lonlabel.className="label horizontal";
	lonlabel.appendChild(document.createTextNode("lon"));

	centraldiv.appendChild(lonlabel);


	//create the div that displays the latitide coordinate and is tracking the mouse cursor on the left of the screen
	var latlabel=document.createElement("div");
	latlabel.className="label vertical";
	latlabel.appendChild(document.createTextNode("lat"));

	centraldiv.appendChild(latlabel);

	//define the funciton that is executed each time the mouse moves within the centraldiv
	centraldiv.onmousemove=function(e) {
		//transform the mouse location to geolocation
		var geo=getGeoFromMouse(e);
		//set the locations of the lat/lon divs to track the mouse
		//here we pass relative coordinates as percentage of the centraldiv width and height 
		lonlabel.style.left=(geo.nx*100)+"%";
		latlabel.style.top=(geo.ny*100)+"%";
	
		//set the text (which the first child) inside each label to the corresponding variable
		//rounded to 2 decimal digits
		lonlabel.firstChild.nodeValue=geo.lon.toFixed(2);
		latlabel.firstChild.nodeValue=geo.lat.toFixed(2);
	};
}

//this function is executed as soon as weather data are received by the server
function onGotWeatherData(geo, wdata) {
	//create a new div. This gets the weatherinfo style (see into.css file) which describes a transparent
	//square with a thin black border
	var newdiv=document.createElement("div");
	newdiv.className="weatherinfo";

	//position the new div under the cursor location
	newdiv.style.left=(geo.nx*100.0)+"%";
	newdiv.style.bottom=((1.0-geo.ny)*100.0)+"%";

	//here we attach the weather data to the div by creating a new property. 
	//in that way its little div remembers all the information received from the server
	//and not just the text that it displays
	newdiv.weather=wdata;

	//this is for debugging. When the user clicks on one of the small divs it prints out
	//its associated weather data to the console
	newdiv.onmousedown=function(e) {
		e.stopPropagation();
		console.log(newdiv.weather);
	}

	//add the text of the country code to the newdiv. This is the country initials that
	//you see 
	newdiv.appendChild(document.createTextNode(wdata.sys.country));

	//create a div below the newdiv to display in small font size the name of the location
	var smalldiv=document.createElement("div");
	smalldiv.className="weatherinfosmall";
	smalldiv.appendChild(document.createTextNode(wdata.name));
	newdiv.appendChild(smalldiv);


	//draw 
	var temp_C=wdata.main.temp-273.15; 			//temperature in celsius. We need to subtract 273.15 to convert form Kelvin to Celsius 
	var clouds=wdata.clouds.all*0.01;			//cloud cover. We convert it from percentage (0 to 100) to fraction (0.0 to 1.0);
	var windangle=wdata.wind.deg*Math.PI/180.0;	//angle of wind direction. Convert from degrees to radians
	var windspd=wdata.wind.speed;				//wind speed

	var wx=-Math.sin(windangle);				//here we use basic trigonometry to find the wind vector components [wx, wy] given tha angle in radians
	var wy=Math.cos(windangle);

	var x=geo.nx*canvas.width;					//get the location of the mouse on the canvas in pixels. The canvas width in pixels is not the same as the central div width because the canvas is an image with fixed resolution stretched to fit the central div
	var y=geo.ny*canvas.height;

	//draw the wind direction line
	graph.strokeStyle="#000000";
	graph.lineWidth=1.0;

	graph.beginPath();
	graph.moveTo(x,y);
	graph.lineTo(x+wx*windspd*2.2,y+wy*windspd*2.2);
	graph.stroke();

	//draw the cloud cover lines in the canvas. We are drawing 0 to 30 (100% cover) 
	graph.strokeStyle="rgba(0,0,0,0.1)";
	graph.lineWidth=1.0;
	graph.beginPath();
	for(var i=0; i<clouds*30; ++i) {
		graph.moveTo(x-20.0-Math.random()*20.0, y+Math.random()*20.0-10.0);
		graph.lineTo(x+20.0+Math.random()*20.0, y+Math.random()*20.0-10.0);
	}
	graph.stroke();

	//append the newly created div with the weather data to the central div so that it 
	//appears in the browser
	centraldiv.appendChild(newdiv);

}

//this utility function takes as input a mouse event ans generates
//a custom object that contains the normalized viewport coordinates for the mouse location
//in relation to centraldiv and the longitude and latitude at tha position
function getGeoFromMouse(_e) {
	var x = _e.pageX - centraldiv.offsetLeft;
    var y = _e.pageY - centraldiv.offsetTop;   

	var normx=x/centraldiv.offsetWidth;
	var normy=y/centraldiv.offsetHeight;

	var lon=normx*360.0-180.0;
	var lat=90.0-normy*180.0;

	return {nx:normx, ny:normy, lat:lat, lon:lon};
}

//This function takes as input a geolocation object generated by getGeoFromMouse
//places the temporary div at the mouse location ot signify that data is under way
//and sends the request to the server for the data
function getWeatherData(_geo, _callback) {
	if (waiting) return; //if we are waiting for another response then do not send a new request. This is so that the server is not overwhelmend if the user starts clicking erratically
	waiting=true; 			//set the waiting flag to true. While this is true no new requests are generated

	//show the temporary gray div element at the mouse location
	waitdiv.style.visibility="visible"; 	
	waitdiv.style.left=(_geo.nx*100.0)+"%";
	waitdiv.style.bottom=((1.0-_geo.ny)*100.0)+"%";


	var url="http://api.openweathermap.org/data/2.5/weather?callback=?";
	var querydata={"lat":_geo.lat, "lon":_geo.lon};
	var onDataReceived= function(_data) {
					waitdiv.style.visibility="hidden"; 	//data received, hide the waiting div
					_callback(_geo, _data);				//call the _callback function provided by the user. In this case it will execute the onGotWeatherData function defined above
					waiting=false; 						//we are ready to ask for more data
				}
	//set a JSONP requests using jquery. 
	//this function will send the querydata to the server at the address designated by the url
	//and when it receives the response from the server that contains the weather data it will run
	//the onDataReceived function defined above
	$.getJSON( url, querydata, onDataReceived);

}
	



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SOCKET
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GetWoNlangkey()
{
	var data = {};

	socket.emit('GetWoNlangkey', data);
}

socket.on("_GetWoNlangkey", function(_data)
{
		for(var i in _data)
		{
			langkey.push(_data[i]);
			lgX.push(0.0);
		}
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SOCKET QUEUE
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//queuing a message simply adds an entry to the queue list
function queueMsg(_msg, _data) {
	queue[_msg]=_data;
}


//this function is called every few milliseconds to emit any pending messages in the queue and then purge it
function tick() {
	for(var i in queue) {
		socket.emit(i, queue[i]);
	}
	queue={};
}

//set the function tick() to repeat every 20 milliseconds. Tick executes and purges the message queue
setInterval(tick, 20);