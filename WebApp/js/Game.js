// Game implements the MessageListener interface

function Game(client, canvas) {
	this._client = client;
	this._canvas = canvas;

	this._linePlot = null; 	// DEV: this is temporary
	this._startTime = 0;	// DEV: this is temporary

	this._finished = false; // DEV: this is temporary
	this._times = [];		// DEV: this is temporary
	this._samples = [];		// DEV: this is temporary
	
	this._setup();
}

Game.prototype.onArrayDataReceived = function(array) {
	var currentTime = new Date().getTime();
	var elapsedTime = (currentTime - this._startTime)/1000;

	if(elapsedTime/60 > 0.1 && !this._finished) {
		this._fillLinePlot();
		this._linePlot.draw();
		this._addLinePlotToCanvas();
		this._linePlot.removeFromDOM();
		this._linePlot = null;
		this._finished = true;
	}
	else if(!this._finished) {
		this._times.push(elapsedTime);
		this._samples.push(array);
	}
}

Game.prototype.onStringDataReceived = function(string) {
	console.log("Server message: " + message.data);
}

Game.prototype._setup = function() {
	this._linePlot = this._createLinePlot();
	this._addRoomToCanvas();
	this._addCarToCanvas();
	this._client.addMessageListener(this);
	this._startTime = new Date().getTime();
}

Game.prototype._fillLinePlot = function() {
	for(var i = 0; i < this._linePlot.getNumDataSeries(); i++) {
		for(var j = 0; j < this._samples.length; j++) {
			var time = this._times[j];
			var sample = this._samples[j][i];
			this._linePlot.addSample(time, sample, i);
		}
	}
}

Game.prototype._addLinePlotToCanvas = function() {
	var linePlotImage = this._linePlot.getImageURL();
	var plot = this._createRectangle(1.25, 1, linePlotImage);
	plot.translate(0, 0, -2);
	plot.addToCanvas();
}

Game.prototype._addRoomToCanvas = function() {
	// TODO
}

Game.prototype._addCarToCanvas = function() {
	var car = new CompositeDrawable(this._canvas);
	car.loadOBJMTL('obj/Model_Car/', 'Model.mtl', 'Model.obj', 'Model.png');
	car.translate(0, -2.675, -20);
	car.setColor([0, 1, 0]);

	car.addToCanvas();
}

Game.prototype._createLinePlot = function() {
	var linePlot = new LinePlot();
	linePlot.hideVisibility();

	linePlot.setNumDataSeries(2);
	linePlot.setTitle("Simulated Data");
	linePlot.setLegendNames(["Channel1", "Channel2"]);
	linePlot.setXAxisTitle("Time Passed (in seconds)");
	linePlot.setYAxisTitle("Voltage");

	return linePlot;
}

Game.prototype._createCyclinder = function(width, height, depth) {
	var xRadius = width/2;
	var yRadius = height/2;

	var numSegments = 4;

	var xyz = [];
	var triangles = [];
	var uv = [];

	for(var i = 0; i < numSegments; i++) {
		xyz.push(xRadius*Math.cos(i*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin(i*2*Math.PI/numSegments));
		xyz.push(0);

		xyz.push(xRadius*Math.cos(i*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin(i*2*Math.PI/numSegments));
		xyz.push(-depth);

		xyz.push(xRadius*Math.cos((i + 1)*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin((i + 1)*2*Math.PI/numSegments));
		xyz.push(0);

		xyz.push(xRadius*Math.cos(i*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin(i*2*Math.PI/numSegments));
		xyz.push(-depth);

		xyz.push(xRadius*Math.cos((i + 1)*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin((i + 1)*2*Math.PI/numSegments));
		xyz.push(-depth);

		xyz.push(xRadius*Math.cos((i + 1)*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin((i + 1)*2*Math.PI/numSegments));
		xyz.push(0);
	}

	// TODO: push triangles and uvs
	// TODO: push roof xyz (perhaps just a rectangle)
}

Game.prototype._createRectangle = function(width, height, image) {
	var halfWidth = width/2;
	var halfHeight = height/2;

	var xyz = [
		-halfWidth, halfHeight, 0,
   		halfWidth, halfHeight, 0,
   		-halfWidth, -halfHeight, 0,
   		halfWidth, -halfHeight, 0
   	];

   	var triangles = [0,2,1,	1,2,3];
   	var uv = [0,1, 1,1, 0,0, 1,0];

	var square = new DrawableObject(this._canvas);
	square.setXYZ(xyz);
	square.setTriangles(triangles);
	square.setUV(uv);
	square.setTexture(image);

	return square;
}

Game.prototype._createBlackText = function(string, height) {
	var text = new Text(this._canvas, string);
	text.setBackgroundColor("white");
	text.setTextColor("black");
	text.setTextHeight(height);
	text.enableSquareTexture();
	
	return text;
}

Game.prototype._createWhiteText = function(string, height) {
	var text = new Text(this._canvas, string);
	text.setBackgroundColor("black");
	text.setTextColor("white");
	text.setTextHeight(height);
	text.enableSquareTexture();
	
	return text;
}

/*
var car = null;
setInterval(animate, 5);
var reachedMax = false;

function animate() {
	if(car != null) {
		if(car.getPosition()[2] <= -150) {
			reachedMax = true;
			return;
		}
		car.translate(0, 0, -0.06);
	}
}
*/
