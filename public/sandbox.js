var centraldiv = null;
var canvas = new fabric.Canvas("sandbox");
var center = {'x': canvas.width/2, 'y': canvas.height/2};

var qm = 15;
var qw = canvas.width/4;
var qh = (canvas.height-(canvas.height/10))/4;
var q1 = {'x':qm, 'y':qh};//{'x':qw - (qw*0.5), 'y':qh};
var q2 = {'x':qw+qm, 'y':qh};
var q3 = {'x':(qw*2)+qm, 'y':qh};
var q4 = {'x':(qw*3)+qm, 'y':qh};

var works = [];
var simgs = [];
var timgs = [];
var get = true;
var right = false;

var mc = {'x': 0, 'y': 0}; //mouse current
var mh = {'x': [0,0,0,0,0,0,0,0,0,0], 'y': [0,0,0,0,0,0,0,0,0,0]}; //mouse history
//var mh = {'x': [0,0,0], 'y': [0,0,0]}; //mouse history
var ma = {'x': 0, 'y': 0}; //mouse averaged history
var md = {'x': 0, 'y': 0}; //mouse delta = current - averaged history
						   //used for deciding whether to shift() or pull()

var tgrab = false;
var pullcheck = true;
var mdown = {'x': 0, 'y': 0};
var adding = false;

//CANVAS EVENTS/////////////////////////////////////////////////////////////////////////////

canvas.on('mouse:move', function(options){
	
	mc.x = options.e.clientX;
	mc.y = options.e.clientY;

	trackMouse();

	if(tgrab == true && mc.y > (canvas.height/10)*9)
	{
			if(md.x > md.y*0.5)
			{
				if(!adding) ShiftAll();
			}
			else
			{
				Pull();
			}
	} 

});


canvas.on('mouse:down', function(options)
{
	tgrab = true;
	mdown.x = mc.x;
	mdown.y = mc.y;

	/*if(options.target)
	{
		options.target.selected = true;
		//console.log("target = " + options.target.type);
	}*/
});

canvas.on('mouse:up', function(options)
{
	tgrab = false;
	mdown.x = 0;

	if(options.target)
	{
		options.target.selected = false;
		//console.log("target != " + options.target.type);
	}
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

	md.x = Math.abs(mc.x - ma.x); 
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
		fabric.Image.fromURL('http://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1024px-Crab_Nebula.jpg', function(oImg)
		{
			//oImg.scale(0.05);
			//imgs.push(oImg);

			AddToTray(oImg);
		});

		if(works.length >= 5)
		{
			get = false;

			works[0].tl = true; //these are the initial bookends
			works[1].tr = true;

			//ImageDisplay();
		}
	}
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
	if(mc.x < ma.x)
	{
		//console.log('left');
		for(var i in timgs)
		{
			//timgs[i].ShiftLeft(md.x);
			timgs[i].f.left -= md.x;
			timgs[i].parent.Update();
			timgs[i].parent.JumpCheck();
		}
	}
	else
	{
		//console.log('right');
		for(var i in timgs)
		{
			//timgs[i].ShiftRight(md.x);
			timgs[i].f.left += md.x;
			timgs[i].parent.Update();
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

		/*
		if(timgs[i].img.selected == true)
		{
			timgs[i].PullCheck();
			console.log('pull');
			break;
		}
		*///
	}
}

//Work Class/////////////////////////////////////////////////////////////////////////////

function Work(_index, _img)
{
	this.ix = _index;
	this.dur = 200;//animation duration
	this.f = _img;

	this.img = new Img(this, this.f); 
	this.img.ix = null; //index is assigned only after this.img is pushed to timgs array
	this.iInit();

	this.simgs = [];

	this.md = false;
}

function Img(_parent, _img)
{
	//this.parent = _parent;
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

	this.img.f.hasBorders = false;
	this.img.f.hasControls = false;
	this.img.f.lockMovementX = true;
	this.img.f.lockMovementY = true;
	this.img.f.isSelectable = false;

	this.Tada();
	this.Update();
}

Work.prototype.Tada = function()
{
	for(var i in timgs)
	{
		timgs[i].parent.MakeWay();
	}

	canvas.add(this.img.f); //add little image to canvas immediately

	adding = true;
	this.img.f.animate('top', '-='+this.img.th, {
		onChange: canvas.renderAll.bind(canvas),
		duration: this.dur,
		//easing: fabric.util.ease.easeOutBounce,
		onComplete: function() {adding = false;}
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
	else
	{
		//console.log("no need to move...");
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
	this.img.f.animate('left', '-='+d, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			//easing: fabric.util.ease.easeOutBounce
		});

	this.Update();
}

Work.prototype.ShiftRight = function(d)
{
	this.img.f.animate('left', '+='+d, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			//easing: fabric.util.ease.easeOutBounce
		});

	this.Update();
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

	this.Update();
}

Work.prototype.PullCheck = function()
{	
	

	if(pullcheck == true)
	{
		//console.log('qw:'+qw+' tcx:'+this.img.tcx);

		pullcheck = false;

		if(this.img.f.left <= qw)//(this.img.tcx <= qw)
		{
			console.log('q1');
			this.Pull(q1);
		}
		else if(this.img.f.left > qw && this.img.f.left <= qw*2)//(this.img.tcx > qw && this.img.tcx <= qw*2)
		{
			console.log('q2');
			this.Pull(q2);
		}
		else if(this.img.f.left > qw*2 && this.img.f.left <= qw*3)//(this.img.tcx > qw*2 && this.img.tcx <= qw*3)
		{
			console.log('q3');
			this.Pull(q3);
		}
		else if(this.img.f.left > qw*3)//(this.img.tcx > qw*3)
		{
			console.log('q4');
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
			/*clone.set({
				left:100,
				top:100
			});*/
			//canvas.add(clone);
			//console.log(clone.left);

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
	
	this.simgs[i].f.animate('left', q.x, //dx //HERE****this.simgs[this.sl-1] is undefined 
	{
		onChange: canvas.renderAll.bind(canvas),
		duration: w.dur
	});

	this.simgs[i].f.animate('top', q.y, //dy
	{
		onChange: canvas.renderAll.bind(canvas),
		duration: w.dur
	});

	this.simgs[i].f.animate('scaleX', s, //dy
	{
		onChange: canvas.renderAll.bind(canvas),
		duration: w.dur
	});

	this.simgs[i].f.animate('scaleY', s, //dy
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

//Work.prototype.Pull = function()


//approach w/ div

//canvas.on('mouse:down',...)

//canvas.add(Img);