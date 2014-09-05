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

var works = [];
var simgs = [];
var timgs = [];
var get = true;
var right = false;
var tgrab = false;
var pullcheck = true;
var mdown = {'x': 0, 'y': 0};
var adding = true;

var mc = {'x': 0, 'y': 0}; //mouse current
var mh = {'x': [0,0,0,0,0,0,0,0,0,0], 'y': [0,0,0,0,0,0,0,0,0,0]}; //mouse history
//var mh = {'x': [0,0,0], 'y': [0,0,0]}; //mouse history
var ma = {'x': 0, 'y': 0}; //mouse averaged history
var md = {'x': 0, 'y': 0}; //mouse delta = current - averaged history
						   //used for deciding whether to shift() or pull()

//CANVAS EVENTS/////////////////////////////////////////////////////////////////////////////

canvas.on('mouse:move', function(options){
	
	mc.x = options.e.clientX;
	mc.y = options.e.clientY;

	trackMouse();

	if(adding == false && tgrab == true)
	{
		if(md.x > md.y*0.3) ShiftAll();
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
	console.log(data);
	receiveImage(data.url);
	if(works.length >= 10) get = false;
});

function receiveImage(url)
{
	//console.log(url);

	fabric.Image.fromURL(url, function(oImg)
	{
		AddToTray(oImg);
	});
	
	if(works.length == 1) works[0].tl = true; //these are the initial bookends
	if(works.length == 2) works[1].tr = true;

	/*
	fabric.Image.fromURL('http://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1024px-Crab_Nebula.jpg', function(oImg)
	{
		AddToTray(oImg);
	});
	*/
}

function AddToTray(img)
{
	var work = new Work(works.length-1, img);
	works.push(work);
	timgs.push(work.img);
	works[works.length-1].img.ix = timgs.length-1;
}

function ShiftAll()
{
	var i = mh.x.length-1;

	var dx = Math.round(Math.abs(mh.x[i] - mh.x[i-2])*0.5);

	if(mh.x[i] < mh.x[i-2])
	{
		/*
		canvas.forEachObject(function(o){
			o.left -=dx;
			o.setCoords();
		});
		*/
		
		for(var i in timgs)
		{
			//console.log('left~'+dx);
			timgs[i].f.left -= dx;
			timgs[i].parent.Update();
			timgs[i].f.setCoords();
			timgs[i].parent.JumpCheck();
			//works[i].ShiftLeft(dx);
			//var l = timgs[i].f.left;
			//timgs[i].f.set('left', l-dx);
			//timgs[i].tx -= dx;
			//timgs[i].parent.U();
			//timgs[i].f.setLeft(l-dx);
		}
	}
	else
	{
		for(var i in timgs)
		{
			//console.log('right~'+dx);
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

		//console.log("mdown.x:" + mdown.x + " mdown.y:" + mdown.y + " tl.x:" + timgs[i].left + "d:" + d + " h:" + h);

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
	this.img.ix = null; //index is assigned only after this.img is pushed to timgs array
	this.iInit();

	this.simgs = [];

	this.md = false;
}

function Img(_parent, _img)
{
	this.parent = _parent;
	this.f = _img;
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
	this.img.tcx = Math.round(this.img.tx+(this.img.tw*0.5));
	this.img.tcy = Math.round(this.img.ty+(this.img.th*0.5));
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
			duration: 0,//this.dur,
			//easing: fabric.util.ease.easeOutBounce
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
			duration: 0,//this.dur,
			//easing: fabric.util.ease.easeOutBounce
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
		
		//console.log('left');

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
			//easing: fabric.util.ease.easeOutBounce
			onComplete: function(){w.Update();}
		});
	} 
	else
	{
		//console.log('right');

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
			//easing: fabric.util.ease.easeOutBounce
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
			this.Pull(q1);
		}
		else if(this.img.f.left > qw && this.img.f.left <= qw*2)
		{
			this.Pull(q2);
		}
		else if(this.img.f.left > qw*2 && this.img.f.left <= qw*3)
		{
			this.Pull(q3);
		}
		else if(this.img.f.left > qw*3)
		{
			this.Pull(q4);
		}
	}
}

Work.prototype.Pull = function(q)
{
	this.Copy(q);
}

Work.prototype.Copy = function(q)
{
	var w = this;

	w.f.clone(function()
	{
		return function(clone)
		{
			var i = new Img(w, clone);
			w.simgs.push(i);
			canvas.add(w.simgs[w.simgs.length-1].f);
			console.log(w.simgs[w.simgs.length-1].f.left);

			w.Up(q);
		};
	}());
}

Work.prototype.Up = function(q)
{
	var w = this;
	var i = this.simgs.length-1

	var s = (qw-(qm*2))/this.f.width; 

	console.log(this.img.f.left + " " + q.x);
	
	this.simgs[i].f.animate('left', q.x, 
	{
		onChange: canvas.renderAll.bind(canvas),
		duration: w.dur
	});

	this.simgs[i].f.animate('top', q.y,
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
			w.PullComplete();
		}
	});
}

Work.prototype.PullComplete = function()
{
	this.Update();
	pullcheck = true;
} 

