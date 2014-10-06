
//ZOOM IN FRAME ////////////////////////////////////////////////////////////////////////////////////////////////////
//ZOOM IN FRAME ////////////////////////////////////////////////////////////////////////////////////////////////////
//ZOOM IN FRAME ////////////////////////////////////////////////////////////////////////////////////////////////////
//ZOOM IN FRAME ////////////////////////////////////////////////////////////////////////////////////////////////////

fabric.Image.filters.Zoominframe = fabric.util.createClass({

	type: 'Zoominframe',

	applyTo: function(canvas) { //E1
	var context = canvas.getContext('2d'), //E1
		imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
		data = imageData.data;
	

		
		if(!occur_once){



		////ZOOM AND CROP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		var x = 0;
		var y = 0;
			console.log('intitial:'+F.getWidth()+' , '+F.getHeight());
			//Scaling commands	
			if(direction == 'in'){scalecrop += 0.1; }
			if(direction == 'out'){scalecrop -= 0.1;}	

			var scaled = 1+scalecrop;
			//Draw image on new temp canvas
			//	var newCanvas = $("<canvas id='newcanvas'>")
			//	 .attr("width", imageData.width)
			//   .attr("height", imageData.height)[0];
			//	newCanvas.getContext("2d").putImageData(imageData, 0, 0);

			if((F.getWidth()*scaled) >= F.getWidth()){
			//Center image in frame when zooming
			var shift_x = -1*(((F.getWidth()*scaled*scaled)/2)-(F.getWidth()*scaled/2));
			var shift_y = -1*(((F.getHeight()*scaled*scaled)/2)-(F.getHeight()*scaled/2));
			context.scale(scaled, scaled);
			context.drawImage(canvas, shift_x, shift_y);
			var imageData = context.getImageData(0,0,canvas.width, canvas.height); 
			context.putImageData(imageData, x,y);
			}else{
			scalecrop = 0;	
			}
			var new_w = F.getWidth()*scaled;
			var new_h = F.getWidth()*scaled;
			console.log('scaled by: '+ scaled);
			console.log('new: '+ F.getWidth()*scaled + ' x ' +F.getHeight()*scaled);
		



		}occur_once = true
		
	}
});



fabric.Image.filters.Zoominframe.fromObject = function(object)
{
	return new fabric.Image.filters.Zoominframe(object);
};


//PAN IN FRAME ////////////////////////////////////////////////////////////////////////////////////////////////////
//PAN IN FRAME ////////////////////////////////////////////////////////////////////////////////////////////////////
//PAN IN FRAME ////////////////////////////////////////////////////////////////////////////////////////////////////
//PAN IN FRAME ////////////////////////////////////////////////////////////////////////////////////////////////////


fabric.Image.filters.Paninframe = fabric.util.createClass({

	type: 'Paninframe',

	applyTo: function(canvas) { //E1
	var context = canvas.getContext('2d'), //E1
		imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
		data = imageData.data;
	

		
		if(!occur_once){



		

		////PAN AND CROP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		
	
	if(direction == 'start'){
		//console.log(mouse_x+" "+mouse_y);
		console.log((mouse_x-F.left)  + " " + (mouse_y-F.top));

				var move_x = (mouse_x-F.left);
				var move_y = (mouse_y-F.top);
				console.log(mouse_x+" "+mouse_y);
				context.drawImage(canvas, move_x, move_y);
				var imageData = context.getImageData(0,0,canvas.width, canvas.height); 
				context.putImageData(imageData, 0,0);



	}


	


		}occur_once = true
		
	}
});



fabric.Image.filters.Paninframe.fromObject = function(object)
{
	return new fabric.Image.filters.Paninframe(object);
};
