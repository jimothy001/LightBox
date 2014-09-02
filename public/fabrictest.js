var centraldiv = null;

var canvas = new fabric.Canvas("bgcanvas");
var imgs = [];
var get = true;

function InIt()
{
	centraldiv = document.getElementByID("central");
}

setInterval(getImage,20);

function getImage()
{
	if(get)
	{
		fabric.Image.fromURL('http://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1024px-Crab_Nebula.jpg', function(oImg)
		{
			//oImg.scale(0.05);
			imgs.push(oImg);
		});

		if(imgs.length >= 10)
		{
			get = false;
			ImageDisplay();
		}
	}
}

function ImageDisplay()
{
	//var s = 0.1;
	//var w = canvas.width/10;
	//var h = w;

	for(var i = 0; i < imgs.length/5; i++)
	{
		for(var j = 0; j < imgs.length/2; j++)
		{
			var index = (i*5)+j;
			var img = imgs[index];

			var x = ((canvas.width/20)*j)+j;
			var y = ((canvas.height/10)*i)+i;

			var w = new Work(index, img, x, y);
			
			/*
			img.scaleToWidth(w);

			img.left = (j * img.getWidth())+(1*j); 
			img.top = (i * img.getHeight())+(1*i);

			img.hasBorders = false;
			img.hasControls = false;
			img.lockMovementX = true;
			img.lockMovementY = true;

			canvas.add(img);
			*/
		}
	}
}

//Work Class/////////////////////////////////////////////////////////////////////////////

function Work(_index, _img, _x, _y)
{
	this.ix = _index;

	this.limg = _img; //little image
	this.lx = _x;
	this.ly = _y;
	this.lw = canvas.width/20;
	
	this.linit();

	this.bimg = _img; //big image
	this.bwo = _img.getWidth(); 
	this.bho = _img.getHeight();
	this.bx = (canvas.width/2)-(this.bw/2);
	this.by = (canvas.height/2)-(this.bh/2);
	
	//this.binit();
}

Work.prototype.linit = function() //little image instatiation
{
	this.limg.scaleToWidth(this.lw);
	this.limg.left = this.lx;
	this.limg.top = this.ly;
	this.limg.hasBorders = false;
	//this.limg.hasControls = false;
	//this.limg.lockMovementX = true;
	//this.limg.lockMovementY = true;

	this.limg //onmousedown function bring up big image

	canvas.add(this.limg); //add little image to canvas immediately
}

Work.prototype.binit = function() //big image instatiation
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

//approach w/ div

//canvas.on('mouse:down',...)

//canvas.add(Img);