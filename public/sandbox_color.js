
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////


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