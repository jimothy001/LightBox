
//GLOBAL VARS///////////////////////////////////////////////////////////////////////////////////////


var socket = io.connect();

var centraldiv = null;
var canvas = new fabric.Canvas("sandbox");
var center = {'x': canvas.width/2, 'y': canvas.height/2};

var qm = 30;
var qw = canvas.width/4;
var qh = (canvas.height-(canvas.height/10))/6;
var q1 = {'x':qm, 'y':qh};//{'x':qw - (qw*0.5), 'y':qh};
var q2 = {'x':qw+qm, 'y':qh};
var q3 = {'x':(qw*2)+qm, 'y':qh};
var q4 = {'x':(qw*3)+qm, 'y':qh};

var tlx = 0;
var trx = 0;

var work = 0;
var _work = 0;
var works = [];
var simgs = {'q1':[], 'q2':[], 'q3':[], 'q4':[]};
var timgs = [];
var get = true;
var right = false;
var tgrab = false;
var pullcheck = true;
var jumpcheck = 0;
var mdown = {'x': 0, 'y': 0};
var adding = true;
var crop = [];

var mc = {'x': 0, 'y': 0}; //mouse current
var mh = {'x': [0,0,0,0,0,0,0,0,0,0], 'y': [0,0,0,0,0,0,0,0,0,0]}; //mouse history
var ma = {'x': 0, 'y': 0}; //mouse averaged history
var md = {'x': 0, 'y': 0}; //mouse delta = current - averaged history
						   //used for deciding whether to shift() or pull()

var cs = 0; //color select
var ft = 0; //filter type
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
var ESC = 27;

//temp//
var imgcount = 1;
var imglimit = 8;

//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////

canvas.on('mouse:move', function(options)
{	
	mc.x = options.e.clientX;
	mc.y = options.e.clientY;

	trackMouse();

	if(adding == false && tgrab == true)
	{
		if(md.x > Math.abs(md.y*0.1)) ShiftAll();
		else if(md.y < 0) Pull();
	} 
});


canvas.on('mouse:down', function(options) //INTERVENE HERE
{
	mdown.x = mc.x;
	mdown.y = mc.y;

	//console.log(options.e);
	//console.log(options.target);

	if(typeof(options.target) == "object")
	{
		options.target.setCoords();

		var tw = options.target.getWidth();
		var th = options.target.getHeight();
		var ta = options.target.getAngle();
		var tl = options.target.oCoords.tl;
	}

	var cw = canvas.width;
	var ch = canvas.height;


	for(var i in timgs)
	{
		if(mdown.x > timgs[i].tx && mdown.x < timgs[i].tx + timgs[i].tw && mdown.y > (canvas.height/10)*9)
		{
			tgrab = true;
		}
	}
});

canvas.on('mouse:up', function(options)
{
	tgrab = false;
	pullcheck = true;
});


canvas.on('mouse:out', function(e) //when mousing from one object to another this is called AFTER mouse:over
{
	if(e.target == work.target) //if object being left matches object that had be entered
	{
		work = 0;
		crop = [];
	}
});

canvas.on('mouse:over', function(e)
{
	work = e;
	work.target.set('centeredScaling', true);

	crop = [];
	crop.push(-work.target.width);//getWidth());
	crop.push(-work.target.height);//.getWidth());
	crop.push(work.target.width);//.getWidth());
	crop.push(work.target.height);//.getHeight());

	//console.log(work.target.width);
});

window.addEventListener("keydown", function(e) //window
{
	//e = e || window.event;
	if(typeof(work.target) == "object")
	{
		if (e.keyCode == LEFT)
		{
         	if(work.target.opacity > 0.5)
         	{
	         	work.target.opacity -= 0.1;
         	}
	    }
	    else if (e.keyCode == RIGHT)
	    {
			if(work.target.opacity < 1.0)
			{
				work.target.opacity += 0.1;
			}
	    }
	    else if (e.keyCode == UP)
	    {
	    	if(work.target.scaleX < 1.0)
	    	{
		    	//work.target.setCoords();

				var l = work.target.left;//-work.target.getWidth()*0.5;
				var t = work.target.top;//-work.target.getHeight()*0.5;
				var w = work.target.getWidth();
				var h = work.target.getHeight();

				var ctx = canvas.getContext('2d');//work.target; //
				
				work.target.clipTo = function(ctx)
				{
					ctx.rect(crop[0],crop[1],crop[2],crop[3]);//ctx.rect(0,0,w,h); // ctx.rect(0,0,1024,1024);//// seems to only be able to reference global vars
				};

		    	work.target.scaleX += 0.01;
		    	work.target.scaleY += 0.01;
	    	}
	    }
	    else if (e.keyCode == DOWN)
	    {
	    	if(work.target.scaleX > 0.2) 
	    	{
		    	//work.target.setCoords();

		    	var l = work.target.left;
				var t = work.target.top;
				var w = work.target.getWidth();
				var h = work.target.getHeight();

				var ctx = canvas.getContext('2d');
				
				work.target.clipTo = function(ctx)
				{
					ctx.rect(crop[0],crop[1],crop[2],crop[3]);// seems to only be able to reference global vars
				};

		    	work.target.scaleX -= 0.01;
		    	work.target.scaleY -= 0.01;
	    	}
	    }
	    else
	    {
		    if (e.keyCode == R)
		    {
		    	cs = 0;
		    	work.target.filters.push(new fabric.Image.filters.CullColor());
		    }
			else if (e.keyCode == G)
		    {
		    	cs = 1;
		    	work.target.filters.push(new fabric.Image.filters.CullColor());
		    }
		    else if (e.keyCode == B)
		    {
		    	cs = 2;
		    	work.target.filters.push(new fabric.Image.filters.CullColor());
		    }
		    else if (e.keyCode == _1)
		    {
		    	cs = 0;
		    	work.target.filters.push(new fabric.Image.filters.IsolateColor());
		    }	    
			else if (e.keyCode == _2)
		    {
		    	cs = 1;
		    	work.target.filters.push(new fabric.Image.filters.IsolateColor());
		    }
		    else if (e.keyCode == _3)
		    {
		    	cs = 2;
		    	work.target.filters.push(new fabric.Image.filters.IsolateColor());
		    }
		    else if (e.keyCode == ESC)
		    {
		    	for(var i in work.target.filters)
		    	{
		    		work.target.filters.pop();
		    	}
		    } 

		    work.target.applyFilters(canvas.renderAll.bind(canvas));
		}

		canvas.renderAll();
	}
}, true);

//GLOBAL FUNCTIONS/////////////////////////////////////////////////////////////////////////////

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

	md.x = Math.abs(mc.x - ma.x); //***NOT TO BE USED TO DETERMINE SHIFT MAGNITUDE
	md.y = mc.y-ma.y;//Math.abs(mc.y - ma.y); 

	mh.x.splice(0,1); //Update mouse history with current
	mh.x.push(mc.x);
	mh.y.splice(0,1);
	mh.y.push(mc.y);
}

setInterval(getImage,1000);

function getImage()
{
	if(get)
	{
		var data = {};
		socket.emit('get-items', data);
	}
}

socket.on('send-items', function(data)
{
	//console.log(data[0].url);
	//receiveImage(data[0].url);
	receiveImage("");
	if(works.length > imglimit) get = false;
});

function receiveImage(url)
{
	//console.log(url);
	/*
	fabric.Image.fromURL(url, function(oImg)
	{
		AddToTray(oImg);
	});
	*/
	/*
	fabric.Image.fromURL('http://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1024px-Crab_Nebula.jpg', function(oImg)
	{
		AddToTray(oImg);
	});
	*/
	fabric.Image.fromURL('../art/'+imgcount+'.jpg', function(oImg)
	{
		AddToTray(oImg);
	});

	imgcount++;

	if(works.length == 1) works[0].img.tl = true; //these are the initial bookends
	if(works.length == 2) works[1].img.tr = true;
}

function AddToTray(img)
{
	var work = new Work(works.length, img);
	works.push(work);
	timgs.push(work.img);
}

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

function Pull()
{
	for(var i in timgs)
	{
		var d = mdown.x - timgs[i].f.left;
		var h = canvas.height - (canvas.height/20);

		if(d > 0 && d < timgs[i].tw && mdown.y > h) //if d is between 0 and thumb width
		{
			timgs[i].parent.PullCheck();
			break;
		}
	}
}