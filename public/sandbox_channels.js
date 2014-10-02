fabric.Image.filters.Redify = fabric.util.createClass({

  type: 'Redify',

  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
        data = imageData.data;
		context.globalCompositeOperation = "lighter";
    for (var i = 0, len = data.length; i < len; i += 4) {
      data[i + 1] = 0;
      data[i + 2] = 0;
     // data[i + 3] = 255- data[i];
    }

    context.putImageData(imageData, 0, 0);
  }
});

fabric.Image.filters.Blueify = fabric.util.createClass({

  type: 'Blueify',

  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
        data = imageData.data;
		context.globalCompositeOperation = "lighter";

    for (var i = 0, len = data.length; i < len; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
    //  data[i + 3] = 255 -data[i+2];
    //  data[i+2] = 255;

    }

    context.putImageData(imageData, 0, 0);
  }
});

fabric.Image.filters.Greenify = fabric.util.createClass({

  type: 'Greenify',

  applyTo: function(canvasEl) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
        data = imageData.data;
		context.globalCompositeOperation = "lighter";

    for (var i = 0, len = data.length; i < len; i += 4) {
      data[i] = 0;
      data[i + 2] = 0;
    //  data[i + 3] = 255 - data[i+1];
			//data[i+1] = 255;
    }

    context.putImageData(imageData, 0, 0);
  }
});