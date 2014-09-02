var centraldiv = null;
var canvas = new fabric.Canvas("sandbox");
var center = {'x': canvas.width/2, 'y': canvas.height/2};

var qw = canvas.width/4;
var qh = (canvas.height-(canvas.height/10))/2;
var q1 = {'x':qw - (qw*0.5), 'y':qh};
var q2 = {'x':(qw*2)-(qw*0.5), 'y':qh};
var q3 = {'x':(qw*3)-(qw*0.5), 'y':qh};
var q4 = {'x':(qw*4)-(qw*0.5), 'y':qh};

var simgs = [];
var timgs = [];
var get = true;
var right = false;

var mc = {'x': 0, 'y': 0}; //mouse current
//var mh = {'x': [0,0,0,0,0,0,0,0,0,0], 'y': [0,0,0,0,0,0,0,0,0,0]}; //mouse history
var mh = {'x': [0,0,0], 'y': [0,0,0]}; //mouse history
var ma = {'x': 0, 'y': 0}; //mouse averaged history
var md = {'x': 0, 'y': 0}; //mouse delta = current - averaged history
						   //used for deciding whether to shift() or pull()

var tgrab = false;
var mdown = {'x': 0, 'y': 0};

canvas.on('mouse:move', function(options){
	
	mc.x = options.e.clientX;
	mc.y = options.e.clientY;

	trackMouse();

	if(tgrab == true && mc.y > (canvas.height/10)*9)
	{
			if(md.x > md.y)
			{
				ShiftAll();
			}
			else
			{
				Pull();
			}
	} 

});


canvas.on('mouse:down', function(options){
	tgrab = true;
	mdown.x = mc.x;
});

canvas.on('mouse:up', function(options){
	tgrab = false;
	mdown.x = 0;
});


function trackMouse()
{
	ma.x = 0;//clear avgs
	ma.y = 0;

	for(var i = 0; i < 3; i++) //for signal smoothing
	{
		ma.x += mh.x[i];
		ma.y += mh.y[i];
	}
	
	ma.x /= 3;
	ma.y /= 3;

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

		if(timgs.length >= 10)
		{
			get = false;

			timgs[0].tl = true; //these are the initial bookends
			timgs[1].tr = true;

			//ImageDisplay();
		}
	}
}

function AddToTray(img)
{
	var work = new Work(timgs.length-1, img);
	timgs.push(work);
}



//Work Class/////////////////////////////////////////////////////////////////////////////

function Work(_index, _img)
{
	this.ix = _index;
	this.dur = 750;//animation duration

	this.timg = _img; //little image
	this.timg.parent = this; //parent

	this.tw = canvas.width/20;
	this.th = 0;
	this.tx = center.x-(this.tw*0.5);
	this.ty = canvas.height-this.th;
	this.tcx = this.tx+(this.tw*0.5);
	this.tcy = this.ty+(this.th*0.5);
	this.tl = false;
	this.tr = false;

	this.tInit();

	this.bimg = _img; //big image
	this.bwo = _img.getWidth(); 
	this.bho = _img.getHeight();
	this.bx = (canvas.width/2)-(this.bw/2);
	this.by = (canvas.height/2)-(this.bh/2);
	
	//this.bInit();

	this.md = false;


	/*this.timg.on('moving', function(options){
		if(md.y > md.x) console.log('!');// this.Pull();
		else ShiftAll();
	});*/
}

Work.prototype.tInit = function() //little image instatiation
{
	this.timg.scaleToWidth(this.tw);
	this.th = this.timg.getHeight();

	this.timg.left = this.tx;
	this.timg.top = this.ty;
	this.timg.hasBorders = false;
	this.timg.hasControls = false;
	this.timg.lockMovementX = true;
	this.timg.lockMovementY = true;
	this.timg.isSelectable = true;

	this.Tada();

	this.Update();

	this.timg.on('selected', function(){
		
		//ShiftAll();

		console.log('!');

		//this.md = true;
		//if(md.y > md.x) console.log('!');// this.Pull();
		//else ShiftAll();
	});

}

Work.prototype.Tada = function()
{
	for(var i in timgs)
	{
		timgs[i].MakeWay();
	}

	canvas.add(this.timg); //add little image to canvas immediately

	this.timg.animate('top', '-='+this.th, {
		onChange: canvas.renderAll.bind(canvas),
		duration: this.dur,
		easing: fabric.util.ease.easeOutBounce
	});
	
	this.Update();
}

Work.prototype.Update = function()
{
	this.tx = this.timg.left;
	this.ty = this.timg.top;
	this.tcx = this.tx+(this.tw*0.5);
	this.tcy = this.ty+(this.th*0.5);
}

Work.prototype.bInit = function() //big image instatiation
{
	if(this.bh > this.bw)
	{
		var h = (canvas.height-this.by)*2;
		this.bimg.scaleToHeight(h);
		this.bh = h;
		this.bw = this.bimg.getWidth(); //width refers to original width, getWidth() returns current
	}
	else
	{
		var w = (canvas.width - this.bx)*2;
		this.bimg.scaleToWidth(w);
		this.bw = w;
		this.bh = this.bimg.getHeight(); //height refers to original height, getHeight() returns current
	}
		this.bimg.left = this.bx;
		this.bimg.top = this.by;
		this.bimg.hasBorders = false;
		this.bimg.hasControls = false;
		this.bimg.lockMovementX = true;
		this.bimg.lockMovementY = true;

		//incorporate buttons - close + add to tray
}

Work.prototype.MakeWay = function()
{
	var x = this.timg.left + (this.timg.getWidth()*0.5);

	if(x == center.x)
	{
		if(right==true)
		{
			right = false;
			this.ShiftRight(this.tw);
		}
		else
		{
			right = true;
			this.ShiftLeft(this.tw);
		}
	}
	else if(x >= center.x && right)
	{
		this.ShiftRight(this.tw);
	}
	else if(x <= center.x && !right)
	{
		this.ShiftLeft(this.tw);
	}
	else
	{
		console.log("no need to move...");
	}

	this.Update();
}

function ShiftAll()
{
	if(mc.x < ma.x)
	{
		//console.log('left');
		for(var i in timgs)
		{
			//timgs[i].ShiftLeft(md.x);
			timgs[i].timg.left -= md.x;
			timgs[i].Update();
			timgs[i].JumpCheck();
		}
	}
	else
	{
		//console.log('right');
		for(var i in timgs)
		{
			//timgs[i].ShiftRight(md.x);
			timgs[i].timg.left += md.x;
			timgs[i].Update();
			timgs[i].JumpCheck();
		}
	}

}

Work.prototype.JumpCheck = function()
{
	var jc = mc.x - mdown.x;

	if(Math.abs(jc) > this.tw)//need a different approach
	{
		if(this.tl && jc < 0) this.TrayJump('r') //jump right
		else if(this.tr && jc > 0) this.TrayJump('l') //jump left
	}
}

Work.prototype.tlClear = function()
{
	
}

Work.prototype.ShiftLeft = function(d) //input will vary depending on if instantiation or mousemove
{
	this.timg.animate('left', '-='+d, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			//easing: fabric.util.ease.easeOutBounce
		});

	this.Update();
}

Work.prototype.ShiftRight = function(d)
{
	this.timg.animate('left', '+='+d, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			//easing: fabric.util.ease.easeOutBounce
		});

	this.Update();
}

Work.prototype.TrayJump = function(d)
{
	if(d == 'l'){
		
		console.log('left');

		this.timg.left = 0; //find jump point at left end of list

		for(var i in timgs)
		{
			timgs[i].tl = false;
		}

		this.tl = true;

		this.timg.animate('left', '+='+this.tw, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			//easing: fabric.util.ease.easeOutBounce
		});
	} 
	else
	{
		console.log('right');

		this.timg.left = canvas.width; //find jump point at right end of list

		for(var i in timgs)
		{
			timgs[i].tr = false;
		}

		this.tr = true;

		this.timg.animate('left', '-='+this.tw, 
		{
			onChange: canvas.renderAll.bind(canvas),
			duration: this.dur,
			//easing: fabric.util.ease.easeOutBounce
		});
	}
	

	this.Update();
}

//Work.prototype.Pull = function()
function Pull()
{
	//if()
	console.log('pull');
}

//approach w/ div

//canvas.on('mouse:down',...)

//canvas.add(Img);