var createCanvas = function() {
	this.driving_canvas = document.createElement("canvas");
	this.driving_canvas.id = "driving_canvas";
	
	this.driving_canvas.style.width = "1000px";
	this.driving_canvas.style.height = "500px";
	
	document.body.appendChild(this.driving_canvas);
	
	return new Canvas(this.driving_canvas.id);
}

var canvas = createCanvas();
document.onkeydown = canvas.handleKeyDown;
document.onkeyup = canvas.handleKeyUp;

canvas.setTrack("http://localhost/webapps/Driving_Sim/track");
