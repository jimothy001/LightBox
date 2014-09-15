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
//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////
//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////
//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////
//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////
//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////
//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////
//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////
//CANVAS EVENTS///////////////////////////////////////////////////////////////////////////////////////

canvas.on('mouse:move', function(options){
	
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

		//var tw = options.target.width;
		//var th = options.target.height;
		var tw = options.target.getWidth();
		var th = options.target.getHeight();
		var ta = options.target.getAngle();
		var tl = options.target.getLeft();
		var tt = options.target.getTop();
		var tc = options.target.oCoords.tl;
		var tox = options.target.getOriginX();
		var toy = options.target.getOriginY();
	}

	var cw = canvas.width;
	var ch = canvas.height;

	//console.log(ta);
	//console.log(tl);
	//console.log(th);
	//console.log(tc);
	//console.log(tox);
	//console.log(toy);

	//console.log(options.target.canvas.getPointer(options.e));
	//console.log(canvas.getPointer(options.e));

	//console.log(e.getPointer(e)); //if(e.target.type == "object") 

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
	    else if (e.keyCode == R)
	    {
	    	cs = 0;
	    	work.target.filters.push(new fabric.Image.filters.CullColor());
			work.target.applyFilters(canvas.renderAll.bind(canvas));
	    }
		else if (e.keyCode == G)
	    {
	    	console.log("keyCode:"+e.keyCode);

	    	cs = 1;
	    	work.target.filters.push(new fabric.Image.filters.CullColor());
			work.target.applyFilters(canvas.renderAll.bind(canvas));
	    }
	    else if (e.keyCode == B)
	    {
	    	cs = 2;
	    	work.target.filters.push(new fabric.Image.filters.CullColor());
			work.target.applyFilters(canvas.renderAll.bind(canvas));
	    }
	    else if (e.keyCode == _1)
	    {
	    	cs = 0;
	    	work.target.filters.push(new fabric.Image.filters.IsolateColor());
			work.target.applyFilters(canvas.renderAll.bind(canvas));
	    }	    
		else if (e.keyCode == _2)
	    {
	    	console.log("keyCode:"+e.keyCode);

	    	cs = 1;
	    	work.target.filters.push(new fabric.Image.filters.IsolateColor());
			work.target.applyFilters(canvas.renderAll.bind(canvas));
	    }
	    else if (e.keyCode == _3)
	    {
	    	cs = 2;
	    	work.target.filters.push(new fabric.Image.filters.IsolateColor());
			work.target.applyFilters(canvas.renderAll.bind(canvas));
	    }
	    else if (e.keyCode == ESC)
	    {
	    	for(var i in work.target.filters)
	    	{
	    		work.target.filters.pop();
	    	}
	    	work.target.applyFilters(canvas.renderAll.bind(canvas));
	    	console.log("filters length:" + work.target.filters.length);
	    } 

		canvas.renderAll();

	}
}, true);

//GLOBAL FUNCTIONS/////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS/////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS/////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS/////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS/////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS/////////////////////////////////////////////////////////////////////////////
//GLOBAL FUNCTIONS/////////////////////////////////////////////////////////////////////////////
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

//Work Class//////////////////////////////////////////////////////////////////////////////////////
//Work Class//////////////////////////////////////////////////////////////////////////////////////
//Work Class//////////////////////////////////////////////////////////////////////////////////////
//Work Class//////////////////////////////////////////////////////////////////////////////////////
//Work Class//////////////////////////////////////////////////////////////////////////////////////
//Work Class//////////////////////////////////////////////////////////////////////////////////////
//Work Class//////////////////////////////////////////////////////////////////////////////////////
//Work Class//////////////////////////////////////////////////////////////////////////////////////
//Work Class//////////////////////////////////////////////////////////////////////////////////////


function Work(_index, _img)
{
	this.ix = _index;
	this.dur = 200;//animation duration
	this.f = _img;
	this.f.set('hasControls',false);

	this.img = new Img(this, this.f); 
	//this.img.ix = null; //index is assigned only after this.img is pushed to timgs array
	this.iInit();

	this.simgs = [];

	this.md = false;
}

function Img(_parent, _img)
{
	this.parent = _parent;
	this.f = _img;

	//this.f.clipTo(crop);
}

Work.prototype.iInit = function()
{
	this.img.parent = this;

	this.img.tw = Math.round(canvas.width/20);
	this.img.th = 0;
	this.img.tx = Math.round(center.x-(this.img.tw*0.5));
	this.img.ty = canvas.height-this.img.th;
	this.img.tcx = Math.round(this.img.tx+(this.img.tw*0.5));
	this.img.tcy = Math.round(this.img.ty+(this.img.th*0.5));
	this.img.tl = false;
	this.img.tr = false;
	this.img.selected = false;

	this.img.f.scaleToWidth(this.img.tw);
	this.img.th = this.img.f.getHeight();
	
	this.img.f.left = this.img.tx;
	this.img.f.top = this.img.ty;
	
	this.img.f.set('hasBorders',false);
	this.img.f.set('hasControls',false);
	this.img.f.set('lockMovementX',true);
	this.img.f.set('lockMovementY',true);
	this.img.f.set('lockRotation',true);
	this.img.f.set('lockScalingX',true);
	this.img.f.set('lockScalingY',true);
	this.img.f.set('selectable',true);
	this.img.f.set('evented',true);

	this.img.crop = null;

	this.Tada();
	this.Update();

}

Work.prototype.Tada = function()
{
	adding = true;

	for(var i in timgs)
	{
		timgs[i].parent.MakeWay();
	}

	canvas.add(this.img.f); //add little image to canvas immediately

	this.img.f.animate('top', '-='+this.img.th, {
		onChange: canvas.renderAll.bind(canvas),
		duration: this.dur,
		//easing: fabric.util.ease.easeOutBounce,
		onComplete: function() {
			if(!get) adding = false;
		}
	});
	
	this.Update();
}

Work.prototype.Update = function()
{
	this.img.tx = this.img.f.left;
	this.img.ty = this.img.f.top;
	this.img.tw = this.img.f.getWidth();
	this.img.th = this.img.f.getHeight();
	this.img.tcx = Math.round(this.img.tx+(this.img.tw*0.5));
	this.img.tcy = Math.round(this.img.ty+(this.img.th*0.5));

	/*this.img.crop.width = this.f.getWidth();
	this.img.crop.height = this.f.getHeight();
	this.img.crop.left = this.f.left;
	this.img.crop.top = this.f.top;*/
}

Work.prototype.MakeWay = function()
{
	var x = this.img.f.left + (this.img.f.getWidth()*0.5);

	if(x == center.x)
	{
		if(right==true)
		{
			right = false;
			this.ShiftRight();
		}
		else
		{
			right = true;
			this.ShiftLeft();
		}
	}
	else if(x >= center.x && right)
	{
		this.ShiftRight();
	}
	else if(x <= center.x && !right)
	{
		this.ShiftLeft();
	}

	this.Update();
}

Work.prototype.ShiftLeft = function() //input will vary depending on if instantiation or mousemove
{
	var w = this;

	this.img.f.animate('left', '-='+this.img.tw, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			onComplete:function()
			{
				w.Update();
				if(w.img.tl == true) tlx = w.img.f.left;
				else if(w.img.tr == true) trx = w.img.f.left;
			}
		});
}

Work.prototype.ShiftRight = function()
{
	var w = this;

	this.img.f.animate('left', '+='+this.img.tw, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			onComplete:function()
			{
				w.Update();
				if(w.img.tl == true) tlx = w.img.f.left;
				else if(w.img.tr == true) trx = w.img.f.left;
			}
		});
}

Work.prototype.JumpLeft = function()
{
	var w = this;

	//find jump point at left end of list
	var imgs = [];
	imgs = Sort("f.left", timgs);
	var tx = imgs[0].f.left-this.img.tw;
	
	tlx = tx;
	this.img.f.left = tx;
	this.img.tl = true;
	this.img.tr = false;

	for(var i in timgs)
	{
		if(timgs[i].parent.ix == imgs[imgs.length-2].parent.ix) //offset
		{
			timgs[i].tr = true;
		}
		else if(timgs[i].parent.ix == imgs[0].parent.ix)
		{
			timgs[i].tl = false;
		}
	}

	this.Update();
	canvas.renderAll();
	jumpcheck = 0;
}

Work.prototype.JumpRight = function()
{
	var w = this;

	//find jump point at right end of list
	var imgs = [];
	imgs = Sort("f.left", timgs);
	var tx = imgs[imgs.length-1].f.left+this.img.tw;

	trx = tx;
	this.img.f.left = tx;
	this.img.tl = false;
	this.img.tr = true;

	for(var i in timgs)
	{
		if(timgs[i].parent.ix == imgs[1].parent.ix)
		{
			timgs[i].tl = true;
		} 
		else if(timgs[i].parent.ix == imgs[imgs.length-1].parent.ix)
		{
			timgs[i].tr = false;
		}
	}

	this.Update();
	canvas.renderAll();
	jumpcheck = 0;
}

Work.prototype.TrayJump = function(d)
{
	var w = this;

	if(d == 'l')
	{
		//find jump point at left end of list
		var imgs = [];
		imgs = Sort("f.left", timgs);
		var tx = imgs[0].f.left-this.img.tw;
		
		tlx = tx;
		this.img.f.left = tx;
		this.img.tr = false;
		this.img.tl = true;

		for(var i in timgs)
		{
			if(timgs[i].parent.ix == imgs[imgs.length-2].parent.ix) //offset
			{
				timgs[i].tr = true;
			}
			else if(timgs[i].parent.ix == imgs[0].parent.ix)
			{
				timgs[i].tl = false;
			}
		}

		this.Update();
		canvas.renderAll();
	} 
	else if(d == 'r')
	{
		//find jump point at right end of list
		var imgs = [];
		imgs = Sort("f.left", timgs);
		var tx = imgs[imgs.length-1].f.left+this.img.tw;

		trx = tx;
		this.img.f.left = tx;
		this.img.tl = false;
		this.img.tr = true;

		for(var i in timgs)
		{
			if(timgs[i].parent.ix == imgs[1].parent.ix)
			{
				timgs[i].tl = true;
			} 
			else if(timgs[i].parent.ix == imgs[imgs.length-1].parent.ix)
			{
				timgs[i].tr = false;
			}
		}

		this.Update();
		canvas.renderAll();
	}

	jumpcheck = 0;
}

var Sort = function(prop, arr) //THIS SORTS NOTHING
{
	prop = prop.split('.');
	var len = prop.length;

	arr.sort(function(a,b){
		var i = 0;
		while(i < len){a = a[prop[i]]; b = b[prop[i]]; i++}
		if(a < b){
			return -1;
		}else if (a > b){
			return 1;
		}else{
			return 0;
		}
	});
	return arr;
}

Work.prototype.PullCheck = function()
{	
	if(pullcheck == true)
	{
		//console.log('qw:'+qw+' tcx:'+this.img.tcx);

		pullcheck = false;

		if(this.img.f.left <= qw)
		{
			this.Pull(q1, 'q1');
		}
		else if(this.img.f.left > qw && this.img.f.left <= qw*2)
		{
			this.Pull(q2, 'q2');
		}
		else if(this.img.f.left > qw*2 && this.img.f.left <= qw*3)
		{
			this.Pull(q3, 'q3');
		}
		else if(this.img.f.left > qw*3)
		{
			this.Pull(q4, 'q4');
		}
	}
}

Work.prototype.Pull = function(q, _q)
{
	var w = this;

	var i = w.ix+1;

	fabric.Image.fromURL('../art/'+i+'.jpg', function(oImg)
	{
		//AddToTray(oImg);
		var img = new Img(w, oImg);

		w.simgs.push(img);
		canvas.add(w.simgs[w.simgs.length-1].f);

		console.log(w.simgs[w.simgs.length-1].f.left);

		w.Up(q, _q);
	});

	/*//this was necessary for images pulled from URLs
	w.f.clone(function() //cloneAsImage
	{

		return function(clone) 
		{
			var i = new Img(w, clone);
			w.simgs.push(i);
			canvas.add(w.simgs[w.simgs.length-1].f);
			console.log(w.simgs[w.simgs.length-1].f.left);

			w.Up(q, _q);
		};
	}());
	*/
}

Work.prototype.Up = function(q, _q)
{
	var w = this;
	var i = this.simgs.length-1
	var s = (qw-(qm*2))/this.f.width; 
	var l = simgs[_q].length;

	//console.log(this.img.f.left + " " + q.x);
	
	this.simgs[i].f.animate('left', q.x + (l*(qm*0.4)), 
	{
		onChange: canvas.renderAll.bind(canvas),
		duration: w.dur
	});

	this.simgs[i].f.animate('top', q.y + (l*qm),
	{
		onChange: canvas.renderAll.bind(canvas),
		duration: w.dur
	});

	this.simgs[i].f.animate('scaleX', s, 
	{
		onChange: canvas.renderAll.bind(canvas),
		duration: w.dur
	});

	this.simgs[i].f.animate('scaleY', s, 
	{
		onChange: canvas.renderAll.bind(canvas),
		duration: w.dur,
		onComplete: function()
		{
			w.PullComplete(i, _q);
		}
	});

	if(l > 0)
	{
		var o = 0.3 + (0.6/l);

		this.simgs[i].f.animate('opacity', o, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: w.dur
		});
	}
}


//
Work.prototype.PullComplete = function(i, _q)
{
	this.simgs[i].f.setCoords();
	this.simgs[i].f.set('centeredScaling', true);
	//this.initCrop(i);
	canvas.renderAll();

	//this.ApplyFilter();
	//this.CullColor();
	//this.IsolateColor();

	this.Update();

	//pullcheck = true;
	//simgs[_q].pop();
	simgs[_q].push(this.simgs[i]);

	//COME BACK TO THIS ISSUE
	/*
		var ix = simgs[_q].length-1;
		var ctx = simgs[_q][ix].f;//canvas.getContext();//

		var l = simgs[_q][ix].f.crop.left;//*0.5;
		var t = simgs[_q][ix].f.crop.top;
		var w = simgs[_q][ix].f.crop.width;
		var h = simgs[_q][ix].f.crop.height;

		simgs[_q][ix].f.clipTo = function(ctx){
			//ctx.rect(-simgs[_q][ix].f.width*0.5, -simgs[_q][ix].f.height*0.5, simgs[_q][ix].f.width, simgs[_q][ix].f.height); // seems to only be able to reference global vars
			ctx.rect(l,t,w,h);
			//simgs[_q][ix].crop;
		};
	*/
}

//COME BACK TO THIS ISSUE
Work.prototype.initCrop = function(i)
{
	var l = -this.simgs[i].f.width*0.5;
	var t = -this.simgs[i].f.height*0.5;
	var w = this.simgs[i].f.width;
	var h = this.simgs[i].f.height;

	this.simgs[i].f.crop = new fabric.Rect({
		left: l,
		top: t,
		width: w,
		height: h,
		fill: "rgba(255,255,255,0)"
	});
}

//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTERS ////////////////////////////////////////////////////////////////////////////////////////////////////


//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////

Work.prototype.CullColor = function()
{
	var i = this.simgs.length-1;
	this.simgs[i].f.filters.push(new fabric.Image.filters.CullColor());
	this.simgs[i].f.applyFilters(canvas.renderAll.bind(canvas));
}

fabric.Image.filters.CullColor = fabric.util.createClass({

	type: 'CullColor',

	applyTo: function(canvas) { //E1
		var context = canvas.getContext('2d'), //E1
			imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
			data = imageData.data;
	
	//here the "canvas" is the image itself
	//data[i-canvas.width] points to pixel above
	console.log("CullColor " + cs);

	var RGB = [0,0,0];
	var P = [0,0,0];

	for(var i = 0, len = data.length; i < len; i += 4)
	{
		RGB[0] += data[i];
		RGB[1] += data[i+1];
		RGB[2] += data[i+2];
	}

	var TOT = RGB[0] + RGB[1] + RGB[2]; //absolute rgb values added together

	P[0] = RGB[0]/TOT;
	P[1] = RGB[1]/TOT;
	P[2] = RGB[2]/TOT;

	var thr = 0.5;
	if(P[cs] < thr) thr = P[cs];

	for(var i = 0, len = data.length; i < len; i += 4)
	{
		var r = data[i];
		var g = data[i+1];
		var b = data[i+2];

		var tot = r+g+b;
		var avg = tot/3;

		var p = //percentages
		[
			r/tot, 
			g/tot, 
			b/tot
		];

		var a = //alpha subtractions
		[
			255-(p[0]*255),
			255-(p[1]*255),
			255-(p[2]*255)
		];

		if(p[cs] > thr)
		{
			data[i] = avg;
			data[i+1] = avg;
			data[i+2] = avg;
			data[i+3] = 125;//1.0;//avg;//0.1;//a[cs];
		} 
	}

	context.putImageData(imageData, 0,0);

	}
});

fabric.Image.filters.CullColor.fromObject = function(object)
{
	return new fabric.Image.filters.CullColor(object);
};

//ISOLATE COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////

Work.prototype.IsolateColor = function()
{
	var i = this.simgs.length-1;
	this.simgs[i].f.filters.push(new fabric.Image.filters.IsolateColor());
	this.simgs[i].f.applyFilters(canvas.renderAll.bind(canvas));
}

fabric.Image.filters.IsolateColor = fabric.util.createClass({

	type: 'IsolateColor',

	applyTo: function(canvas) 
	{
		var context = canvas.getContext('2d'),
			imageData = context.getImageData(0,0,canvas.width, canvas.height),
			data = imageData.data;
	
	//here the "canvas" is the image itself
	//data[i-canvas.width] points to pixel above
	var _cs = (cs + 1) % 3;
	var __cs = (cs + 2) % 3;
	var RGB = [0,0,0];
	var P = [0,0,0];

	for(var i = 0, len = data.length; i < len; i += 4)
	{
		RGB[0] += data[i];
		RGB[1] += data[i+1];
		RGB[2] += data[i+2];
	}

	var TOT = RGB[0] + RGB[1] + RGB[2]; //absolute rgb values added together

	P[0] = RGB[0]/TOT;
	P[1] = RGB[1]/TOT;
	P[2] = RGB[2]/TOT;

	var _thr = 0.5;
	var __thr = 0.5;
	if(P[_cs] < _thr) _thr = P[_cs];
	if(P[__cs] < _thr) __thr = P[__cs];

	for(var i = 0, len = data.length; i < len; i += 4)
	{
		var r = data[i];
		var g = data[i+1];
		var b = data[i+2];

		var tot = r+g+b;
		var avg = tot/3;

		var p = //percentages
		[
			r/tot, 
			g/tot, 
			b/tot
		];

		var a = //alpha subtractions
		[
			255-(p[0]*255),
			255-(p[1]*255),
			255-(p[2]*255)
		];

		if(p[_cs] > _thr)
		{
			data[i] = avg;
			data[i+1] = avg;
			data[i+2] = avg;
			data[i+3] = 125;//1.0;//avg;//0.1;//a[_cs];
		} 
		else if(p[__cs] > __thr)
		{
			data[i] = avg;
			data[i+1] = avg;
			data[i+2] = avg;
			data[i+3] = 125;//1.0;//avg;//0.1;//a[__cs];
		}
	}

	context.putImageData(imageData, 0,0);

	}
});

fabric.Image.filters.IsolateColor.fromObject = function(object)
{
	return new fabric.Image.filters.IsolateColor(object);
};