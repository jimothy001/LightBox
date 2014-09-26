
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////

fabric.Image.filters.ZoomPaninframe = fabric.util.createClass({

	type: 'ZoomPaninframe',

	applyTo: function(canvas) { //E1
	var context = canvas.getContext('2d'), //E1
		imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
		data = imageData.data;
	
		//here the "canvas" is the image itself
		//data[i-canvas.width] points to pixel above
		

		var x = 0;
		var y = 0;

		if(command == 'zoom'){

			var scalecrop = 0;
				
			//Scaling commands	
			if(direction == 'in'){scalecrop = 1.2; }
			if(direction == 'out'){scalecrop = 0.90;}	

			//Draw image on new temp canvas
			//	var newCanvas = $("<canvas id='newcanvas'>")
			//	 .attr("width", imageData.width)
			//   .attr("height", imageData.height)[0];
			//	newCanvas.getContext("2d").putImageData(imageData, 0, 0);

			//Center image in frame when zooming
			var shift_x = -1*((F.getWidth()*scalecrop)-F.getWidth());
			var shift_y = -1*((F.getHeight()*scalecrop)-F.getHeight());

			context.scale(scalecrop, scalecrop);
			context.drawImage(canvas, shift_x, shift_y);
			var imageData = context.getImageData(0,0,canvas.width, canvas.height); 
			
			context.putImageData(imageData, x,y);
		}
		

		if(command == 'pan'){
			
	    window.onmousemove = handleMouseMove;
	    function handleMouseMove(event) {
	        event = event || window.event; // IE-ism
	        // event.clientX and event.clientY contain the mouse position	
	        x = event.clientX;
	        y = event.clientY;
	        
	        console.log(x+' , '+y);

	        context.putImageData(imageData, x,y);
	    }

		}


		
	}
});

fabric.Image.filters.ZoomPaninframe.fromObject = function(object)
{
	return new fabric.Image.filters.ZoomPaninframe(object);
};
