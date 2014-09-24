
//GLOBAL VARS/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GLOBAL VARS/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GLOBAL VARS/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GLOBAL VARS/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//external libraries
var socket = io.connect();
var canvas = new fabric.Canvas("sandbox");

//spatial parameters
var center = {'x': canvas.width/2, 'y': canvas.height/2}; //canvas center
var qw = canvas.width/4; //quadrant width
var qh = (canvas.height-(canvas.height/10))/6; //quadrant height
var qm = 30; //quadrant margin
var q1 = {'x':qm, 'y':qh}; //quadrant 1 pull target coordinates
var q2 = {'x':qw+qm, 'y':qh}; //quadrant 2 pull target coordinates
var q3 = {'x':(qw*2)+qm, 'y':qh}; //quadrant 3 pull target coordinates
var q4 = {'x':(qw*3)+qm, 'y':qh}; //quadrant 4 pull target coordinates

//images
var F = 0; //fabric object as target for mouse and key events, starts as non-object
var works = []; //array of work objects
var simgs = {'q1':[], 'q2':[], 'q3':[], 'q4':[]}; //2d array of sandbox images
var crop = []; //temporary cropping region coordinates
var timgs = []; //array of tray images
var tlx = 0; //x coordinate of right-most tray image
var trx = 0; //x coordinate of left-most tray image

//action checks
var adding = true; //are images being added to the tray?
var right = false; //should an image be moved to the right so that it can make way for an incoming image? If not, left.
var tgrab = false; //is user trying to grab an image in tray, either to move the tray or pull an image?
var pullcheck = false; //is the user in the midst of pulling an image?
var jumpcheck = 0; //if over tray image width triggers jump

//mouse
var mc = {x: 0, y: 0}; //mouse current
var mh = {x: [0,0,0,0,0,0,0,0,0,0], y: [0,0,0,0,0,0,0,0,0,0]}; //mouse history
var ma = {x: 0, y: 0}; //mouse averaged history
var md = {x: 0, y: 0}; //mouse delta = current - averaged history
						   //used for deciding whether to shift() or pull()
var mdown = {x: 0, y: 0}; //mouse down coordinates, separate from mouse current
var px = {x:0, y:0}; //equivilant of mouse position in original image, used for pixel sampling

//temp
var imagezoom = 1;
var colorselect = 0; //color select
var zoomselect = 0;
var zoomdir = 0;
var imgcount = 1; //number of images that have been added to tray
var imglimit = 8; //limit for imgcount
var get = true;  //should we continue asking for images from the local host?

//temp ascii keyCodes
var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var R = 82;
var G = 71;
var B = 66;
var _1 = 49;
var _2 = 50;
var _3 = 51;
var Q = 81;
var W = 87;
var ESC = 27;

var A = 65;
var D = 68;
var SHIFT = 16;


//GET IMAGES ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GET IMAGES ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GET IMAGES ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GET IMAGES ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TEMPORARY - ASK FOR IMAGES FROM LOCAL HOST
setInterval(getImage,500);
function getImage()
{
	if(get)
	{
		var data = {};
		socket.emit('get-items', data);
	}
}

/*socket.on('updated-db', function(data)
{
	var data = {};
	socket.emit('get-items', data);
});*/

//LISTENS FOR MESSAGE WITH IMAGE URL FROM LOCAL HOST
//CALL RECEIVEIMAGE()
socket.on('send-items', function(data)
{
	console.log('!');

	//receiveImage(data[0].url);
	receiveImage("");

	if(works.length > imglimit) get = false;
});

//CREATE NEW FABRIC IMAGE OBJECT VIA URL FROM LOCAL HOST
// - TEMPORARY - USE IMAGE DIRECTLY FROM LOCAL HOST DUE TO PERMISSIONS ISSUE
//CALL ADDTOTRAY()
function receiveImage(url)
{ 
	//console.log(url);

	fabric.Image.fromURL('../art/'+imgcount+'.jpg', function(oImg)
	{
		AddToTray(oImg);
	});

	imgcount++;

	if(works.length == 1) works[0].img.tl = true; //these are the initial bookends
	if(works.length == 2) works[1].img.tr = true;
}

//INSTANTIATE WORK OBJECT WITH FABRIC IMAGE OBJECT
//PUSH WORK OBJECT AND ITS THUMBNAIL FABRIC IMAGE OBJECT TO GLOBAL LISTS
function AddToTray(img)
{
	var work = new Work(works.length, img);
	works.push(work);
	timgs.push(work.img);
}

//FABRIC CANVAS EVENTS////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FABRIC CANVAS EVENTS////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FABRIC CANVAS EVENTS////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FABRIC CANVAS EVENTS////////////////////////////////////////////////////////////////////////////////////////////////////////////

//ON MOUSEMOVE CALL TRACKMOUSE() AND POSSIBLY SHIFT OR PULL THUMBNAILS
canvas.on('mouse:move', function(options)
{	
	mc.x = options.e.clientX;
	mc.y = options.e.clientY;

	trackMouse();

	if(adding == false && tgrab == true && pullcheck == false)
	{
		if(md.x > Math.abs(md.y*0.1)) ShiftAll();
		else if(md.y < 0) Pull();
	} 
});

//ON MOUSEOVER DEFINE GLOBAL WORK VAR AS EVENT TARGET
canvas.on('mouse:over', function(e)
{
	if(typeof(e.target == "object"))
	{
		F = e.target;
		canvas.setActiveObject(F);

		crop = [];
		crop.push(-F.width);//getWidth());
		crop.push(-F.height);//.getWidth());
		crop.push(F.width);//.getWidth());
		crop.push(F.height);//.getHeight());
	}
});

//RESET VARS ON MOUSEOUT, ACCOUNT FOR TIMING
canvas.on('mouse:out', function(e) //when mousing from one object to another this is called AFTER mouse:over for some reason
{
	if(e.target == F) //if object being left matches object that had be entered
	{
		F = 0; //make F non-object
		crop = []; //empty crop rect coordinates
		canvas.discardActiveObject();
	}
});

//ON MOUSEDOWN SEE IF WE ARE CLICKING ON A FABRIC OBJECT OR TRAY
canvas.on('mouse:down', function(e)
{
	//mouse
	mdown.x = mc.x;
	mdown.y = mc.y;

	if(mdown.y > (canvas.height/10)*9) //for tray interaction
	{
		for(var i in timgs)
		{
			if(mdown.x > timgs[i].tx && mdown.x < timgs[i].tx + timgs[i].tw)
			{
				tgrab = true;
			}
		}
	}
	else if(typeof(e.target) == "object") //for pixel selection
	{
		e.target.setCoords();

		var tw = e.target.getWidth();
		var th = e.target.getHeight();
		var ta = e.target.getAngle();
		var tl = e.target.oCoords.tl;
	}
});

//ON MOUSEUP RESET CHECK VARS
canvas.on('mouse:up', function(options)
{
	tgrab = false;
	pullcheck = false;
});

//KEYDOWN EVENTS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//KEYDOWN EVENTS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//KEYDOWN EVENTS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//KEYDOWN EVENTS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("keydown", function(e) //window
{
	//e = e || window.event;
	if(typeof(F) == "object")
	{
		if (e.keyCode == LEFT) //SUBTRACT OPACITY
		{
         	if(F.opacity > 0.5)
         	{
	         	F.opacity -= 0.1;
         	}
	    }
	    else if (e.keyCode == RIGHT) //ADD OPACITY
	    {
			if(F.opacity < 1.0)
			{
				F.opacity += 0.1;
			}
	    }
	   /* else if (e.keyCode == UP) //ZOOM IN - PROBLEMATIC******
	    {

	    	console.log('scale larger');

	    	if(F.scaleX < 1.0)
	    	{
				var l = F.left;//-F.getWidth()*0.5;
				var t = F.top;//-F.getHeight()*0.5;
				var w = F.getWidth();
				var h = F.getHeight();
				
				console.log(l);
				
				var ctx = canvas.getContext('2d');//F; //
				
				F.clipTo = function(ctx)
				{
					ctx.rect(crop[0],crop[1],crop[2],crop[3]);//ctx.rect(0,0,w,h); // ctx.rect(0,0,1024,1024);//// seems to only be able to reference global vars
				};

		    	F.scaleX += 0.01;
		    	F.scaleY += 0.01;
	    	}
	    }
	    else if (e.keyCode == DOWN) //ZOOM OUT - PROBLEMATIC*******
	    {

	    	console.log('scale smaller');

	    	if(F.scaleX > 0.2) 
	    	{
		    	var l = F.left;
				var t = F.top;
				var w = F.getWidth();
				var h = F.getHeight();

				var ctx = canvas.getContext('2d');
				
				F.clipTo = function(ctx)
				{
					ctx.rect(crop[0],crop[1],crop[2],crop[3]);// seems to only be able to reference global vars
				};

		    	F.scaleX -= 0.01;
		    	F.scaleY -= 0.01;
	    	}
	    }*/

	    ///SCALING WITH FRAME
	    else if (e.keyCode == UP) {Zoominframe('scale','in');}
	    else if (e.keyCode == DOWN) {Zoominframe('scale','out');}


	   	///ZOOMING & PANNING WITHIN FRAME
	   	else if (e.keyCode == A) {ZoomPaninframe('zoom','in');}
	    else if (e.keyCode == D) {ZoomPaninframe('zoom','out');}
	   	else if (e.keyCode == SHIFT) {ZoomPaninframe('pan');}	    
    

	    else
	    {
		    if (e.keyCode == R) CullChannel(0);
			else if (e.keyCode == G) CullChannel(1);
		    else if (e.keyCode == B) CullChannel(2);
		    else if (e.keyCode == _1) IsolateChannel(0);
			else if (e.keyCode == _2) IsolateChannel(1);
		    else if (e.keyCode == _3) IsolateChannel(2);
		    else if (e.keyCode == Q) CullColor();
		    else if (e.keyCode == ESC) ClearFilters();
		}

		canvas.renderAll();
	}
}, true);

//GLOBAL FUNCTIONS CALLED FROM EVENTS///////////////////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS CALLED FROM EVENTS///////////////////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS CALLED FROM EVENTS///////////////////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS CALLED FROM EVENTS///////////////////////////////////////////////////////////////////////////////////////////

//MOUSE SIGNAL SMOOTHING, CALLED FROM MOUSEMOVE
function trackMouse()
{
	ma.x = 0;//clear avgs
	ma.y = 0;

	for(var i = 0; i < 10; i++) //for signal smoothing
	{
		ma.x += mh.x[i];
		ma.y += mh.y[i];
	}
	
	ma.x /= 10;
	ma.y /= 10;

	md.x = Math.abs(mc.x - ma.x);
	md.y = mc.y-ma.y;

	mh.x.splice(0,1); //Update mouse history with current
	mh.x.push(mc.x);
	mh.y.splice(0,1);
	mh.y.push(mc.y);
}

//SHIFTS ALL IMAGES TRAY
function ShiftAll()
{
	var i = mh.x.length-1;

	var dx = Math.round(mh.x[i] - mh.x[i-1]);

	for(var i in timgs)
	{
		timgs[i].f.left += dx;
		timgs[i].parent.Update();
		timgs[i].f.setCoords();
		if(timgs[i].f.left < tlx) timgs[i].parent.JumpRight();
		else if(timgs[i].f.left > trx) timgs[i].parent.JumpLeft();
	}

	jumpcheck++;
}

//FIGURES OUT WHICH IMAGE TO PULL FROM TRAY BASED ON MOUSE POSITION
function Pull()
{
	pullcheck = true;

	for(var i in timgs)
	{
		var d = mdown.x - timgs[i].f.left;
		var h = canvas.height - (canvas.height/20);

		if(d > 0 && d < timgs[i].tw && mdown.y > h) //if d is between 0 and thumb width
		{
			timgs[i].parent.PullDir();
			break;
		}
	}
}


function ZoomPaninframe(d,c)
{
	direction = c;
	command = d;

	if(direction == 'scale'){
		var w_old = F.getWidth();
		var h_old = F.getHeight();
		if(zoomdir == 'in'){
			F.scaleX += 0.01;
			F.scaleY += 0.01;
		}
		if(direction == 'out'){
			F.scaleX -= 0.01;
			F.scaleY -= 0.01;
		}
		//get new image frame dimensions
		var w = F.getWidth();
		var h = F.getHeight();
		//center image frame
		F.left = F.left - (w - w_old)/2;
		F.top = F.top - (h - h_old)/2;
	}

	if(command == 'zoom' || command == 'pan'){
	F.filters.push(new fabric.Image.filters.ZoomPaninframe());
	F.applyFilters(canvas.renderAll.bind(canvas));
	}
}


function CullColor(c)
{
	colorselect = c;
	F.filters.push(new fabric.Image.filters.CullColor());
	F.applyFilters(canvas.renderAll.bind(canvas));
}

function IsolateChannel(c)
{
	colorselect = c;
	F.filters.push(new fabric.Image.filters.IsolateColor());
	F.applyFilters(canvas.renderAll.bind(canvas));
}

function CullColor()
{
	var tl = {x:F.oCoords.tl.x, y:F.oCoords.tl.y};
	var iw = F.getWidth();
	var ih = F.getHeight();
	var ow = F.getOriginalSize().width;
	var oh = F.getOriginalSize().height;
	 
	px = {x:0, y:0};
	px.x = (mc.x - tl.x) * (ow / iw);
	px.y = (mc.y - tl.y) * (oh / ih);

	console.log("ow: " + ow + "  " + "oh: " + oh);
	console.log("px.x: " + px.x + "  " + "px.y: " + px.y);

	F.filters.push(new fabric.Image.filters.CullColor());
	//F.filters.push(new fabric.Image.filters.PXTest());
	F.applyFilters(canvas.renderAll.bind(canvas));
}

function ClearFilters()
{
	for(var i in F.filters)
	{
		F.filters.pop();
	}
	F.applyFilters(canvas.renderAll.bind(canvas));
}


		
