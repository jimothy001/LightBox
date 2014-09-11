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

var work = 0;
var works = [];
var simgs = {'q1':[], 'q2':[], 'q3':[], 'q4':[]};
var timgs = [];
var get = true;
var right = false;
var tgrab = false;
var pullcheck = true;
var mdown = {'x': 0, 'y': 0};
var adding = true;
var crop = [];


var mc = {'x': 0, 'y': 0}; //mouse current
var mh = {'x': [0,0,0,0,0,0,0,0,0,0], 'y': [0,0,0,0,0,0,0,0,0,0]}; //mouse history
//var mh = {'x': [0,0,0], 'y': [0,0,0]}; //mouse history
var ma = {'x': 0, 'y': 0}; //mouse averaged history
var md = {'x': 0, 'y': 0}; //mouse delta = current - averaged history
						   //used for deciding whether to shift() or pull()

var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

//temp
var imgcount = 1;

//CANVAS EVENTS/////////////////////////////////////////////////////////////////////////////

canvas.on('mouse:move', function(options){
	
	mc.x = options.e.clientX;
	mc.y = options.e.clientY;

	trackMouse();

	if(adding == false && tgrab == true)
	{
		if(md.x > md.y*0.1) ShiftAll();
		else Pull();
	} 
});


canvas.on('mouse:down', function(options)
{
	mdown.x = mc.x;
	mdown.y = mc.y;

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
});

canvas.on('mouse:over', function(e)
{
	work = e;
	work.target.set('centeredScaling', true);
	work.target.centeredScaling = true;

	//crop = [];
	crop.push(-work.target.width);//getWidth());
	crop.push(-work.target.height);//.getWidth());
	crop.push(work.target.width);//.getWidth());
	crop.push(work.target.height);//.getHeight());

	//console.log(work.target.width);
});

canvas.on('mouse:out', function(e)
{
	work = 0;
	crop = [];

	//console.log(work);
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
	         	canvas.renderAll();
         	}
	    }
	    else if (e.keyCode == RIGHT)
	    {
			if(work.target.opacity < 1.0)
			{
				work.target.opacity += 0.1;
				canvas.renderAll();
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

		    	//work.target.scale += 0.01;

		    	canvas.renderAll();
	    	}
	    }
	    else if (e.keyCode == DOWN)
	    {
	    	if(work.target.scaleX > 0.2) 
	    	{
		    	//work.target.setCoords();

		    	var l = work.target.left;//-work.target.getWidth()*0.5;//work.target.crop.left;
				var t = work.target.top;//-work.target.getHeight()*0.5;//work.target.crop.top;
				var w = work.target.getWidth();//work.target.crop.width;
				var h = work.target.getHeight();//work.target.crop.height;

				var ctx = canvas.getContext('2d');//work.target; //
				
				work.target.clipTo = function(ctx)
				{
					ctx.rect(crop[0],crop[1],crop[2],crop[3]);//ctx.rect(0,0,1024,1024);////ctx.rect(0,0,w,h); // seems to only be able to reference global vars
				};

		    	work.target.scaleX -= 0.01;
		    	work.target.scaleY -= 0.01;

		    	//work.target.scale -= 0.01;

		    	canvas.renderAll();
	    	}
	    }

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
	md.y = Math.abs(mc.y - ma.y); 

	mh.x.splice(0,1); //Update mouse history with current
	mh.x.push(mc.x);
	mh.y.splice(0,1);
	mh.y.push(mc.y);

	//console.log(mc.x + " a:" + ma.x + "   " + mc.y + " a:" + ma.y);
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
	receiveImage(data[0].url);
	if(works.length > 8) get = false;
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

	if(works.length == 1) works[0].tl = true; //these are the initial bookends
	if(works.length == 2) works[1].tr = true;
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

	var dx = Math.round(Math.abs(mh.x[i] - mh.x[i-2])*0.5);

	if(mh.x[i] < mh.x[i-2])
	{
		for(var i in timgs)
		{
			//console.log('left~'+dx);
			timgs[i].f.left -= dx;
			timgs[i].parent.Update();
			timgs[i].f.setCoords();
			timgs[i].parent.JumpCheck();
		}
	}
	else
	{
		for(var i in timgs)
		{
			timgs[i].f.left += dx;//md.x;
			timgs[i].parent.Update();
			timgs[i].f.setCoords();
			timgs[i].parent.JumpCheck();
		}
	}

}

function Pull()
{
	for(var i in timgs)
	{
		var d = mdown.x - timgs[i].f.left;
		var h = canvas.height - (canvas.height/20);

		if(d > 0 && d < timgs[i].tw && mdown.y > h) //if d is between 0 and thumb width
		{
			//console.log(timgs[i].tw);
			timgs[i].parent.PullCheck();
			break;
		}
	}
}

//Work Class/////////////////////////////////////////////////////////////////////////////

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

	this.img.f.crop = null;

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
	//this.img.tw = this.img.f.width;
	//this.img.th = this.img.f.height;
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
			this.ShiftRight(this.img.tw);
		}
		else
		{
			right = true;
			this.ShiftLeft(this.img.tw);
		}
	}
	else if(x >= center.x && right)
	{
		this.ShiftRight(this.img.tw);
	}
	else if(x <= center.x && !right)
	{
		this.ShiftLeft(this.img.tw);
	}

	this.Update();
}


Work.prototype.JumpCheck = function()
{
	var jc = mc.x - mdown.x;

	if(Math.abs(jc) > this.img.tw)//need a different approach
	{
		if(this.img.tl && jc < 0) this.TrayJump('r') //jump right
		else if(this.img.tr && jc > 0) this.TrayJump('l') //jump left
	}
}

Work.prototype.ShiftLeft = function(d) //input will vary depending on if instantiation or mousemove
{
	//console.log('ShiftLeft');
	var w = this;

	this.img.f.animate('left', '-='+d, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			onComplete:function(){
				w.Update();
				w.JumpCheck();
			}
		});
}

Work.prototype.ShiftRight = function(d)
{
	//console.log('ShiftRight');
	var w = this;

	this.img.f.animate('left', '+='+d, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			onComplete:function(){
				w.Update();
				w.JumpCheck();
			}
		});
}

Work.prototype.TrayJump = function(d)
{
	var w = this;

	if(d == 'l'){

		this.img.f.left = 0; //find jump point at left end of list

		for(var i in timgs)
		{
			timgs[i].tl = false;
		}

		this.img.tl = true;

		this.img.f.animate('left', '+='+this.img.tw, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			onComplete: function(){w.Update();}
		});
	} 
	else
	{

		this.img.f.left = canvas.width; //find jump point at right end of list

		for(var i in timgs)
		{
			timgs[i].tr = false;
		}

		this.img.tr = true;

		this.img.f.animate('left', '-='+this.img.tw, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			onComplete: function(){w.Update();}
		});
	}
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

	console.log(this.img.f.left + " " + q.x);
	
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

var radius = qw*0.75;

//
Work.prototype.PullComplete = function(i, _q)
{
	this.simgs[i].f.setCoords();
	this.simgs[i].f.set('centeredScaling', true);
	//this.initCrop(i);
	canvas.renderAll();

	this.ApplyFilter();

	this.Update();
	pullcheck = true;

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

//FILTERS /////////////////////////////////////////////////////////////////////////////

Work.prototype.ApplyFilter = function()
{
	var i = this.simgs.length-1;

	this.simgs[i].f.filters.push(new fabric.Image.filters.SelectiveAlpha());
	this.simgs[i].f.applyFilters(canvas.renderAll.bind(canvas));

	//this.simgs[i].f.filters.push(new fabric.Image.filters.Sepia());
  	//this.simgs[i].f.applyFilters(canvas.renderAll.bind(canvas));

	
}



fabric.Image.filters.SelectiveAlpha = fabric.util.createClass({

	type: 'SelectiveAlpha',

	applyTo: function(canvas) { //E1
		var context = canvas.getContext('2d'), //E1
			imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
			data = imageData.data;
	
	//here the "canvas" is the image itself
	//data[i-canvas.width] points to pixel above

	var buffer = 0.5;
	var asub = 0.9;


	for(var i = 0, len = data.length; i < len; i += 4)
	{
		var r = data[i];
		var g = data[i+1];
		var b = data[i+2];

		var tot = r+g+b;
		var avg = tot/3;
		var rper = r/tot;
		var gbper = (g+b)/tot;
		var a = 255-(rper*255);

		if(rper > buffer)
		{
			data[i] = avg;
			data[i+1] = avg;
			data[i+2] = avg;
			data[i+3] = a;//gbper;//0;//a;
		} 
	}

	context.putImageData(imageData, 0,0);

	}
});

fabric.Image.filters.SelectiveAlpha.fromObject = function(object)
{
	return new fabric.Image.filters.SelectiveAlpha(object);
};
