
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////
//CULL COLOR ////////////////////////////////////////////////////////////////////////////////////////////////////

fabric.Image.filters.Paninframe = fabric.util.createClass({

	type: 'Paninframe',

	applyTo: function(canvas) { //E1
	var context = canvas.getContext('2d'), //E1
		imageData = context.getImageData(0,0,canvas.width, canvas.height), //E1
		data = imageData.data;
	

		
		if(!occur_once){



		

		////PAN AND CROP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	if(command == 'pan'){
		
	
	if(direction == 'start'){
		//console.log(mouse_x+" "+mouse_y);
		console.log((mouse_x-F.left)  + " " + (mouse_y-F.top));

				var move_x = (mouse_x-F.left);
				var move_y = (mouse_y-F.top);

				context.drawImage(canvas, move_x, move_y);
				var imageData = context.getImageData(0,0,canvas.width, canvas.height); 
				context.putImageData(imageData, 0,0);



	}


	}



	/*	if(command == 'pan'){
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
						
							//BEGIN PANNING / CANVAS ///////
					
							context.scale(2, 2);
							context.drawImage(canvas, 100, 100);
							var imageData = context.getImageData(0,0,canvas.width, canvas.height); 
							context.putImageData(imageData, 0,0);



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


		}*/


		}occur_once = true
		
	}
});



fabric.Image.filters.Paninframe.fromObject = function(object)
{
	return new fabric.Image.filters.Paninframe(object);
};
