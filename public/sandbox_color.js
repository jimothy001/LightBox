
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

	applyTo: function(canvas) { 
		var context = canvas.getContext('2d'), 
			imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
			data = imageData.data;
	
	//here the "canvas" is the image itself
	//data[i-canvas.width] points to pixel above

	var RGB = [0,0,0]; //rgb values
	var P = [0,0,0]; //percentages

	var p = (((canvas.width * Math.round(px.y)) + Math.round(px.x))*4)-4; //index of pixel
	var sr = 10; //sample radius

	//console.log("x:" + Math.round(px.x) + " y:" + Math.round(px.y));
	console.log("p: " + p);
	console.log("data length: " + data.length);
	console.log("@ p: " + data[p] + " " + data[p+1] + " " + data[p+2]);
	
	for(var i = 1; i < sr+1; i++) //pixel info in serialized rgba values
	{
		var l = p - (4*i);
		var r = p + (4*i);
		var t = p - (canvas.width*4*i);
		var b = p + (canvas.width*4*i);

		RGB[0] += data[l]+data[r]+data[t]+data[b];
		RGB[1] += data[l+1]+data[r+1]+data[t+1]+data[b+1];
		RGB[2] += data[l+2]+data[r+2]+data[t+2]+data[b+2];


		for(var j = 1; j < sr+1; j++)
		{
			var tl = (p-(4*i))-(canvas.width*4*j);
			var tr = (p+(4*i))-(canvas.width*4*j);
			var bl = (p-(4*i))+(canvas.width*4*j);
			var br = (p+(4*i))+(canvas.width*4*j);

			RGB[0] += data[tl]+data[tr]+data[bl]+data[br];
			RGB[1] += data[tl+1]+data[tr+1]+data[bl+1]+data[br+1];
			RGB[2] += data[tl+2]+data[tr+2]+data[bl+2]+data[br+2];
		}
	}

	//RGB[0] /= ((sr+1) * (sr+1))*4;
	//RGB[1] /= ((sr+1) * (sr+1))*4;
	//RGB[2] /= ((sr+1) * (sr+1))*4;

	var TOT = RGB[0] + RGB[1] + RGB[2]; //absolute rgb values added together

	P[0] = RGB[0]/TOT;
	P[1] = RGB[1]/TOT;
	P[2] = RGB[2]/TOT;

	//console.log("AVG: " + (RGB[0] + " " + RGB[1] + " " + RGB[2]));
	console.log("AVG: " + (P[0]*255) + " " + (P[1]*255) + " " + (P[2]*255));

	var thr = 0.1;
	//if(P[colorselect] < thr) thr = P[colorselect];

	var count = 0;

	for(var i = 0, len = data.length; i < len; i += 4)
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

		var r = Math.abs(p[0]-P[0]);//Math.abs(_r - RGB[0]);//
		var g = Math.abs(p[1]-P[1]);//Math.abs(_g - RGB[1]);//
		var b = Math.abs(p[2]-P[2]);//Math.abs(_b - RGB[2]);//

		if(r < thr && g < thr && b < thr) //should select color
		{
			data[i] = avg;
			data[i+1] = avg;
			data[i+2] = avg;
			data[i+3] = 125;

			count++;
		} 
	}
	
	context.putImageData(imageData, 0,0);

	}
});

fabric.Image.filters.CullColor.fromObject = function(object)
{
	return new fabric.Image.filters.CullColor(object);
};

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