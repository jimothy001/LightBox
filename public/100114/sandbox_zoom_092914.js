
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
	

		
		if(!occur_once){



		//here the "canvas" is the image itself
		//data[i-canvas.width] points to pixel above
		

		var x = 0;
		var y = 0;

		if(command == 'zoom'){

			//scalecrop += 0.1;


				
			//Scaling commands	
			if(direction == 'in'){scalecrop += 0.1; }
			if(direction == 'out'){scalecrop -= 0.1;}	

			var scaled = 1+scalecrop;
			//Draw image on new temp canvas
			//	var newCanvas = $("<canvas id='newcanvas'>")
			//	 .attr("width", imageData.width)
			//   .attr("height", imageData.height)[0];
			//	newCanvas.getContext("2d").putImageData(imageData, 0, 0);

			//Center image in frame when zooming
			var shift_x = -1*((F.getWidth()*scaled)-F.getWidth());
			var shift_y = -1*((F.getHeight()*scaled)-F.getHeight());

			context.scale(scaled, scaled);
			context.drawImage(canvas, shift_x, shift_y);
			var imageData = context.getImageData(0,0,canvas.width, canvas.height); 
			
			context.putImageData(imageData, x,y);
			
			var new_w = F.getWidth()*scaled;
			var new_h = F.getWidth()*scaled;
			console.log('scaled by: '+ scaled);
			console.log('wxh: '+ F.getWidth()*scaled + ' x ' +F.getHeight()*scaled);

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
		occur_once = true
		
	}
});



fabric.Image.filters.ZoomPaninframe.fromObject = function(object)
{
	return new fabric.Image.filters.ZoomPaninframe(object);
};
