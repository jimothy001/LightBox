
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



		////ZOOM AND CROP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		var x = 0;
		var y = 0;
		if(command == 'zoom'){
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
		}
		

		////PAN AND CROP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		if(command == 'pan'){
		var x = 0;
		var y = 0;


			var timer = null, mouseX = 0, mouseY = 0, enableHandler = false;
			$('canvas').mousemove(function (e) {
				if(direction == 'start'){
				if(!mousemove_occur_once){
				if (enableHandler) {
					mouseX = parseInt(e.pageX);
					mouseY = parseInt(e.pageY);
					console.log(mouseX+" "+mouseY);
				

			
					//END PANNING / CANVAS ///////
					enableHandler = false;
			    }
			    }
			    }mousemove_occur_once = true;
			});
			
			timer = window.setInterval(function(){
			    enableHandler = true;
			}, 50);

			
if(direction == 'stop'){
console.log('stop');

			
}


		}

/*
		if(command == 'pan'){
			var timer = null, mouseX = 0, mouseY = 0, enableHandler = false;
			$('canvas').mousemove(function (e) {
				if(direction == 'start'){
				if (enableHandler) {
					mouseX = parseInt(e.pageX);
					mouseY = parseInt(e.pageY);
					console.log(mouseX+" "+mouseY);
					
					//START PANNING / CANVAS ///////
					//console.log('intitial:'+F.getWidth()+' , '+F.getHeight());

					context.scale(2, 2);
					context.drawImage(canvas, 0, 0);
					var imageData = context.getImageData(0,0,canvas.width, canvas.height); 
					context.putImageData(imageData, 0,0);

			
					//END PANNING / CANVAS ///////
					enableHandler = false;
			    }
			    }
			});
			timer = window.setInterval(function(){
			    enableHandler = true;
			}, 1000);
			//$(document).click(function () {
			//   	enableHandler = true;
			//});

		}*/




		}occur_once = true
		
	}
});



fabric.Image.filters.ZoomPaninframe.fromObject = function(object)
{
	return new fabric.Image.filters.ZoomPaninframe(object);
};
