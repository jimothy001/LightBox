//CONSTRUCTORS AND INITIAL PARAMETERS//////////////////////////////////////////////////////////////////////////////////////
//CONSTRUCTORS AND INITIAL PARAMETERS//////////////////////////////////////////////////////////////////////////////////////
//CONSTRUCTORS AND INITIAL PARAMETERS//////////////////////////////////////////////////////////////////////////////////////
//CONSTRUCTORS AND INITIAL PARAMETERS//////////////////////////////////////////////////////////////////////////////////////

//PRIMARY OBJECT
function Work(_index, _img) 
{
	this.ix = _index;
	this.dur = 200;//animation duration
	this.f = _img;
	this.f.set('hasControls',false);

	this.img = new Img(this, this.f); 
	this.TrayParameters(this.img.f);

	this.simgs = [];
	this.md = false;

	this.Tada();
	this.Update();
}

//CHILD OF PRIMARY OBJECT THAT CARRIES FABRIC OBJECT - MAY LATER PROVE UNNECESSARY
function Img(_parent, _img)
{
	this.parent = _parent;
	this.f = _img;

	//image sized as thumbnail
	this.tw = Math.round(canvas.width/20); //width
	this.f.scaleToWidth(this.tw);
	this.th = this.f.getHeight(); //height

	this.tx = Math.round(center.x-(this.tw*0.5)); //x pos - left
	this.ty = canvas.height;//y pos - top
	this.tl = false; //true if image is at left end of tray
	this.tr = false; //true if image is at right end of tray
	this.selected = false; //true if image is selected

	//set fabric object parameters
	this.f.left = this.tx;
	this.f.top = this.ty;

	//rect for cropping
	this.crop = null;
}

//ASSIGN "TRAY" PARAMETERS FOR FABRIC OBJECT
Work.prototype.TrayParameters = function(f)
{
	f.set('hasBorders',false);
	f.set('hasControls',false);
	f.set('lockMovementX',true);
	f.set('lockMovementY',true);
	f.set('lockRotation',true);
	f.set('lockScalingX',true);
	f.set('lockScalingY',true);
	f.set('selectable',true);
	f.set('evented',true);
}

//ASSIGN "SANDBOX" PARAMETERS FOR FABRIC OBJECT
Work.prototype.SandboxParameters = function(f)
{
	f.set('hasBorders',false);
	f.set('hasControls',true);
	f.set
	({
		cornerColor: 'rgba(50,50,50,0.4)', //'gray',
		transparentCorners: true
	});
	f.set('lockMovementX',false);
	f.set('lockMovementY',false);
	f.set('lockRotation',false);
	f.set('lockScalingX',false);
	f.set('lockScalingY',false);
	f.set('centeredScaling', true);
	f.set('selectable',true);
	f.set('evented',true);
	f.set('hasRotatingPoint', false);

	f.set
	({
		left: this.img.f.left,
		top: this.img.f.left,
		width: this.img.f.width,
		height: this.img.f.height
	});

}

//ADDS WORK'S VARS BASED ON THOSE OF CURRENT FABRIC IMAGE
Work.prototype.Update = function()
{
	this.img.tx = this.img.f.left;
	this.img.ty = this.img.f.top;
	this.img.tw = this.img.f.getWidth();
	this.img.th = this.img.f.getHeight();

	/*this.img.crop.width = this.f.getWidth();
	this.img.crop.height = this.f.getHeight();
	this.img.crop.left = this.f.left;
	this.img.crop.top = this.f.top;*/
}

//ON THUMBNAIL INSTANTIATION/////////////////////////////////////////////////////////////////////////////////////////////////
//ON THUMBNAIL INSTANTIATION/////////////////////////////////////////////////////////////////////////////////////////////////
//ON THUMBNAIL INSTANTIATION/////////////////////////////////////////////////////////////////////////////////////////////////
//ON THUMBNAIL INSTANTIATION/////////////////////////////////////////////////////////////////////////////////////////////////

//ADDS WORK'S FABRIC IMAGE TO TRAY
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

//SHIFTS THUMBNAIL IMAGE LEFT OR RIGHT IN ORDER 
//TO MAKE ROOM FOR INCOMING THUMBNAIL IMAGE, ALTERNATING
Work.prototype.MakeWay = function()
{
	var x = this.img.f.left + (this.img.f.getWidth()*0.5);

	if(x == center.x)//
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

//SHIFTS THUMBNAIL LEFT
Work.prototype.ShiftLeft = function()
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

//SHIFTS THUMBNAIL RIGHT
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

//ON TRAY DRAG//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ON TRAY DRAG//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ON TRAY DRAG//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ON TRAY DRAG//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//CAUSES THUMBNAIL TO JUMP TO LEFT END OF TRAY, 
//CALLED IF THUMBNAIL GOES BEYOND RIGHT EXTENT OF TRAY
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

//CAUSES THUMBNAIL TO JUMP TO RIGHT END OF TRAY, 
//CALLED IF THUMBNAIL GOES BEYOND LEFT EXTENT OF TRAY
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

//RETURNS ARRAY OF TRAY IMAGES REORDERED BY LEFT X COORDINATE, 
//USED TO PROVED COORDINATE FOR THUMBNAIL TO JUMP TO
var Sort = function(prop, arr)
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

//ON PULLING A THUMBNAIL INTO SANDBOX/////////////////////////////////////////////////////////////////////////////////////////
//ON PULLING A THUMBNAIL INTO SANDBOX/////////////////////////////////////////////////////////////////////////////////////////
//ON PULLING A THUMBNAIL INTO SANDBOX/////////////////////////////////////////////////////////////////////////////////////////
//ON PULLING A THUMBNAIL INTO SANDBOX/////////////////////////////////////////////////////////////////////////////////////////

//CHECKS WHICH SANDBOX SECTION AN IMAGE SHOULD BE 'PULLED' INTO, CALLS PULL()
Work.prototype.PullDir = function()
{	
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

//INSTANTIATES NEW FABRIC OBJECT FROM URL, APPLIES PARAMETERS, 
//PUSHES IT TO WORKS' ARRAY OF SANDBOX IMAGES, CALLS UP()
Work.prototype.Pull = function(q, _q)
{
	var w = this;
	var i = w.ix+1;

	fabric.Image.fromURL('../art/'+i+'.jpg', function(oImg)
	{
		//AddToTray(oImg);
		var img = new Img(w, oImg);
		w.SandboxParameters(img.f);
		

		w.simgs.push(img);
		canvas.add(w.simgs[w.simgs.length-1].f);

		console.log(w.simgs[w.simgs.length-1].f.left);

		w.Up(q, _q);
	});

	/*//this was necessary for images pulled from external URLs
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

//ANIMATES MOVEMENT AND EXPANSION OF NEWLY INSTANTIATED 
//FABRIC OBJECT INTO SPECIFIED SANDBOX SECTION, CALLS PULLCOMPLETE()
Work.prototype.Up = function(q, _q)
{
	var w = this;
	var i = this.simgs.length-1
	var s = (qw-(qm*2))/this.f.width; 
	var l = simgs[_q].length;
	
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

//UPDATES OBJECT VARIABLES AND PUSHES NEWLY INSTANTIATED 
//FABRIC OBJECT TO GLOBAL LIST OF SANDBOX IMAGES
Work.prototype.PullComplete = function(i, _q)
{
	//this.CullColorOnArrival();
	//this.IsolateColorOnArrival();

	this.simgs[i].f.setCoords();
	simgs[_q].push(this.simgs[i]);
	//this.initCrop(i); - CROPPING - PROBLEMATIC******
	
	this.Update();
	canvas.renderAll();
}

//INSTANTIATES CROPPING RECTANGLE - PROBLEMATIC******
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

	/*
		var ix = simgs[_q].length-1;
		var ctx = simgs[_q][ix].f;//canvas.getContext();//

		var l = simgs[_q][ix].f.crop.left;//*0.5;
		var t = simgs[_q][ix].f.crop.top;
		var w = simgs[_q][ix].f.crop.width;
		var h = simgs[_q][ix].f.crop.height;

		simgs[_q][ix].f.clipTo = function(ctx){
			//ctx.rect(-simgs[_q][ix].f.width*0.5, -simgs[_q][ix].f.height*0.5, simgs[_q][ix].f.width, simgs[_q][ix].f.height); 
			// seems to only be able to reference global vars
			ctx.rect(l,t,w,h);
			//simgs[_q][ix].crop;
		};
	*/
}

//EARLY COLOR EXPERIMENTATION////////////////////////////////////////////////////////////////////////////////////////////////
//EARLY COLOR EXPERIMENTATION////////////////////////////////////////////////////////////////////////////////////////////////
//EARLY COLOR EXPERIMENTATION////////////////////////////////////////////////////////////////////////////////////////////////
//EARLY COLOR EXPERIMENTATION////////////////////////////////////////////////////////////////////////////////////////////////

//FOR INITIAL EXPERIMENTATION WITH COLOR FILTERS
Work.prototype.CullColorOnArrival = function()
{
	var i = this.simgs.length-1;
	this.simgs[i].f.filters.push(new fabric.Image.filters.CullColor());
	this.simgs[i].f.applyFilters(canvas.renderAll.bind(canvas));
}

//FOR INITIAL EXPERIMENTATION WITH COLOR FILTERS
Work.prototype.IsolateColorOnArrival = function()
{
	var i = this.simgs.length-1;
	this.simgs[i].f.filters.push(new fabric.Image.filters.IsolateColor());
	this.simgs[i].f.applyFilters(canvas.renderAll.bind(canvas));
}