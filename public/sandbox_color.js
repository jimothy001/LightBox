
//CULL CHANNEL ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL CHANNEL ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL CHANNEL ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL CHANNEL ////////////////////////////////////////////////////////////////////////////////////////////////////

fabric.Image.filters.CullChannel = fabric.util.createClass({

	type: 'CullChannel',

	applyTo: function(canvas) { //E1
		var context = canvas.getContext('2d'), //E1
			imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
			data = imageData.data;
	
	//here the "canvas" is the image itself
	//data[i-canvas.width] points to pixel above
	console.log("CullChannel " + colorselect);

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
	if(P[colorselect] < thr) thr = P[colorselect];

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

		if(p[colorselect] > thr)
		{
			data[i] = avg;
			data[i+1] = avg;
			data[i+2] = avg;
			data[i+3] = 125;
		} 
	}

	context.putImageData(imageData, 0,0);

	}
});

fabric.Image.filters.CullChannel.fromObject = function(object)
{
	return new fabric.Image.filters.CullChannel(object);
};

//ISOLATE CHANNEL ////////////////////////////////////////////////////////////////////////////////////////////////////
//ISOLATE CHANNEL ////////////////////////////////////////////////////////////////////////////////////////////////////
//ISOLATE CHANNEL ////////////////////////////////////////////////////////////////////////////////////////////////////
//ISOLATE CHANNEL ////////////////////////////////////////////////////////////////////////////////////////////////////

fabric.Image.filters.IsolateChannel = fabric.util.createClass({

	type: 'IsolateChannel',

	applyTo: function(canvas) 
	{
		var context = canvas.getContext('2d'),
			imageData = context.getImageData(0,0,canvas.width, canvas.height),
			data = imageData.data;
	
	//here the "canvas" is the image itself
	//data[i-canvas.width] points to pixel above
	var _cs = (colorselect + 1) % 3;
	var __cs = (colorselect + 2) % 3;
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

		if(p[_cs] > _thr)
		{
			data[i] = avg;
			data[i+1] = avg;
			data[i+2] = avg;
			data[i+3] = 125;
		} 
		else if(p[__cs] > __thr)
		{
			data[i] = avg;
			data[i+1] = avg;
			data[i+2] = avg;
			data[i+3] = 125;
		}
	}

	context.putImageData(imageData, 0,0);

	}
});

fabric.Image.filters.IsolateChannel.fromObject = function(object)
{
	return new fabric.Image.filters.IsolateChannel(object);
};

//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////

fabric.Image.filters.CullColor = fabric.util.createClass({

	type: 'CullColor',

	applyTo: function(canvas) {  //here the "canvas" is the image itself
		var context = canvas.getContext('2d'), 
			imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
			data = imageData.data;
	
		var p = (((canvas.width * Math.round(px.y)) + Math.round(px.x))*4)-4; //index of pixel
		var sr = 5; //sample radius	

		var P = AreaRGBpercentages(p, sr, canvas, data);
		//console.log("AVG: " + (P[0]*255) + " " + (P[1]*255) + " " + (P[2]*255));

		//var thr = 0.08;
		var T = FindRGBThreshold(P, data);
		console.log(T);

		for(var i = 0, len = data.length; i < len; i += 4)
		{
			var rgbv = CompareRGB(i, P, data);

			if(rgbv[0] < T[0] && rgbv[1] < T[1] && rgbv[2] < T[2]) //should select color
			{
				data[i] = rgbv[3];
				data[i+1] = rgbv[3];
				data[i+2] = rgbv[3];
				data[i+3] = 100;
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
//ISOLATE COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//ISOLATE COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//ISOLATE COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////

fabric.Image.filters.IsolateColor = fabric.util.createClass({

	type: 'IsolateColor',

	applyTo: function(canvas) {  //here the "canvas" is the image itself
		var context = canvas.getContext('2d'), 
			imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
			data = imageData.data;
	
		var p = (((canvas.width * Math.round(px.y)) + Math.round(px.x))*4)-4; //index of pixel
		var sr = 5; //sample radius	

		var P = AreaRGBpercentages(p, sr, canvas, data);
		//console.log("AVG: " + (P[0]*255) + " " + (P[1]*255) + " " + (P[2]*255));

		//var thr = 0.02;
		var T = FindRGBThreshold(P, data);
		console.log(T);

		for(var i = 0, len = data.length; i < len; i += 4)
		{
			var rgbv = CompareRGB(i, P, data);

			if(rgbv[0] > T[0] && rgbv[1] > T[1] && rgbv[2] > T[2]) //should select color
			{
				data[i] = rgbv[3];
				data[i+1] = rgbv[3];
				data[i+2] = rgbv[3];
				data[i+3] = 100;
			} 
		}
		
		context.putImageData(imageData, 0,0);
	}
});

fabric.Image.filters.IsolateColor.fromObject = function(object)
{
	return new fabric.Image.filters.IsolateColor(object);
};


//SHARED FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////////////////
//SHARED FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////////////////
//SHARED FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////////////////
//SHARED FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////////////////

//gets absolute RGB values for area
var AreaRGBpercentages = function(p, sr, icanvas, data) //pixel index, sample radius, image canvas (not main canvas), image data
{
	var RGB = [0,0,0]; //rgb values

	for(var i = 1; i < sr+1; i++) //pixel info in serialized rgba values
	{
		var l = p - (4*i);
		var r = p + (4*i);
		var t = p - (icanvas.width*4*i);
		var b = p + (icanvas.width*4*i);

		RGB[0] += data[l]+data[r]+data[t]+data[b];
		RGB[1] += data[l+1]+data[r+1]+data[t+1]+data[b+1];
		RGB[2] += data[l+2]+data[r+2]+data[t+2]+data[b+2];

		for(var j = 1; j < sr+1; j++)
		{
			var tl = (p-(4*i))-(icanvas.width*4*j);
			var tr = (p+(4*i))-(icanvas.width*4*j);
			var bl = (p-(4*i))+(icanvas.width*4*j);
			var br = (p+(4*i))+(icanvas.width*4*j);

			RGB[0] += data[tl]+data[tr]+data[bl]+data[br];
			RGB[1] += data[tl+1]+data[tr+1]+data[bl+1]+data[br+1];
			RGB[2] += data[tl+2]+data[tr+2]+data[bl+2]+data[br+2];
		}
	}

	var TOT = RGB[0] + RGB[1] + RGB[2];
	var P = [RGB[0]/TOT, RGB[1]/TOT, RGB[2]/TOT]; //percentages

	return P;
}

var FindRGBThreshold = function(P, data)
{
	var RGB = [0,0,0];
	for(var i = 0, len = data.length; i < len; i += 4) //get RGB totals from entire image
	{
		RGB[0] += data[i];
		RGB[1] += data[i+1];
		RGB[2] += data[i+2];
		//data[i+3]; //leverage alpha?
	}

	//get avg of RGB to compare against
	var AVG = [RGB[0]/data.length, RGB[1]/data.length, RGB[2]/data.length]; //rgb avgs
	var vTOT = AVG[0] + AVG[1] + AVG[2]; //total rgb avgs
	var pAVG = [AVG[0]/vTOT, AVG[1]/vTOT, AVG[2]/vTOT]; //rgb avgs as percentages

	//get avg of differences between all pixes and RGB avg - to what degree does each color channel vary?
	var dRGB = [0,0,0];
	for(var i = 0, len = data.length; i < len; i += 4) //get RGB totals from entire image
	{
		dRGB[0] += Math.abs(data[i]-AVG[0]);
		dRGB[1] += Math.abs(data[i+1]-AVG[1]);
		dRGB[2] += Math.abs(data[i+2]-AVG[2]);
	}

	var dTOT = dRGB[0] + dRGB[1] + dRGB[2]; //overall contrast of image
	var D = [dRGB[0]/dTOT, dRGB[1]/dTOT, dRGB[2]/dTOT]; //percentages of averaged variation from average channel values
														//if difference between pixel values and sampled values greater than average variation 
														//(or portion thereof) from all three channels do something


	var pdTOT = 1/(dTOT/data.length);

	var adj = 0.75; //try raising and lowering 
	var T = [0,0,0];
	T[0] = Math.abs(P[0] - D[0])*adj;//+pdTOT;//-
	T[1] = Math.abs(P[1] - D[1])*adj;//+pdTOT;
	T[2] = Math.abs(P[2] - D[2])*adj;//+pdTOT;

	//T[0] = P[0] - (P[0] * D[0]);//Math.abs(pdTOT * D[0]);//Math.abs(P[0] - D[0]);//Math.abs(P[0] - pAVG[0]);//Math.abs(P[0] - D[0]) * pAVG[0];//pAVG[0]*D[0];//Math.abs(pAVG[0] - D[0]);//P[0] * Math.abs(pAVG[0] - D[0]);//D[0] * P[0];//Math.abs(P[0]-pAVG[0])*D[0]; //the higher the dif between P and pAVG the looser the threshold for color removal or isolation
	//T[1] = P[1] - (P[1] * D[1]);//Math.abs(pdTOT * D[1]);//Math.abs(P[1] - pAVG[1]);//Math.abs(P[1] - D[1]) * pAVG[1];//pAVG[1]*D[1];//Math.abs(pAVG[1] - D[1]);//P[1] * Math.abs(pAVG[1] - D[1]);//D[1] * P[1];//Math.abs(P[1]-pAVG[1])*D[1]; //the lower the dif between P and pAVG the tighter the threshold for color removal or isolation
	//T[2] = P[2] - (P[2] * D[2]);//Math.abs(pdTOT * D[2]);//Math.abs(P[2] - pAVG[2]);//Math.abs(P[2] - D[2]) * pAVG[2];//pAVG[2]*D[2];//Math.abs(pAVG[2] - D[2]);//P[2] * Math.abs(pAVG[2] - D[2]);//D[2] * P[2];//Math.abs(P[2]-pAVG[2])*D[2];

	return T;
}

var CompareRGB = function(i, P, data) //index, percentages to compare against, image data
{
	var _r = data[i];
	var _g = data[i+1];
	var _b = data[i+2];
	var tot = _r+_g+_b;
	var avg = tot/3;

	var p = //percentages
	[
		_r/tot, 
		_g/tot, 
		_b/tot
	];

	var rgbv = [Math.abs(p[0]-P[0]), Math.abs(p[1]-P[1]), Math.abs(p[2]-P[2]), avg]
	
	return rgbv;
}







//PX TEST ////////////////////////////////////////////////////////////////////////////////////////////////////
//PX TEST ////////////////////////////////////////////////////////////////////////////////////////////////////
//PX TEST ////////////////////////////////////////////////////////////////////////////////////////////////////
//PX TEST ////////////////////////////////////////////////////////////////////////////////////////////////////

fabric.Image.filters.PXTest = fabric.util.createClass({

	type: 'PXTest',

	applyTo: function(canvas) { //here the "canvas" is the image itself
		var context = canvas.getContext('2d'), 
			imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
			data = imageData.data;
	

	var RGB = [0,0,0]; //rgb values
	var P = [0,0,0]; //percentages

	var p = (((canvas.width * Math.round(px.y)) + Math.round(px.x))*4)-4; //index of pixel
	var sr = 10; //sample radius

	console.log("p: " + p);
	console.log("data length: " + data.length);
	console.log("@ p: " + data[p] + " " + data[p+1] + " " + data[p+2]);
	
	for(var i = 1; i < sr+1; i++) //pixel info in serialized rgba values
	{
		var l = p - (4*i);
		var r = p + (4*i);
		var t = p - (canvas.width*4*i);
		var b = p + (canvas.width*4*i);

		data[l] = 255;
		data[r] = 255;
		data[t] = 255;
		data[b] = 255;
		data[l+1] = 255;
		data[r+1] = 255;
		data[t+1] = 255;
		data[b+1] = 255;
		data[l+2] = 255;
		data[r+2] = 255;
		data[t+2] = 255;
		data[b+2] = 255;

		for(var j = 1; j < sr+1; j++)
		{
			var tl = (p-(4*i))-(canvas.width*4*j);
			var tr = (p+(4*i))-(canvas.width*4*j);
			var bl = (p-(4*i))+(canvas.width*4*j);
			var br = (p+(4*i))+(canvas.width*4*j);

			data[tl] = 255;
			data[tr] = 255;
			data[bl] = 255;
			data[br] = 255;
			data[tl+1] = 255;
			data[tr+1] = 255;
			data[bl+1] = 255;
			data[br+1] = 255;
			data[tl+2] = 255;
			data[tr+2] = 255;
			data[bl+2] = 255;
			data[br+2] = 255;
		}
	}
	
	context.putImageData(imageData, 0,0);

	}
});

fabric.Image.filters.PXTest.fromObject = function(object)
{
	return new fabric.Image.filters.PXTest(object);
};

