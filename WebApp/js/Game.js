// Game implements the MessageListener interface

function Game(client, canvas) {
	this._client = client;
	this._canvas = canvas;

	this._state = GameState.MENU;

	this._driver = new Driver(this._canvas);

	this._currentStateStartTime = 0;

	this._linePlot = null; 	// DEV: this is temporary
	this._startTime = 0;	// DEV: this is temporary

	this._times = [];		// DEV: this is temporary
	this._samples = [];		// DEV: this is temporary

	this._setup();
}

Game.prototype._setup = function() {
	this._canvas.addDrawListener(this);
	this._linePlot = this._createLinePlot();
	this._addRoomToCanvas();
	this._addCarToCanvas();
	this._client.addMessageListener(this);
	this._startTime = new Date().getTime();
}

Game.prototype.onArrayDataReceived = function(array) {
	var currentTime = new Date().getTime();
	var elapsedTime = (currentTime - this._currentStateStartTime)/1000;

	this._updateDriverSpeed(array);

	this._times.push(elapsedTime);
	this._samples.push(array);
}

Game.prototype._updateDriverSpeed = function(array) {
	var brakeForce = array[0];
	var gasPedalPosition = array[1];
	var gasPedalForce = array[2];

	var speed = this._convertToSpeed(brakeForce, gasPedalPosition, gasPedalForce);

	this._driver.changeSpeed(speed);
}

Game.prototype._convertToSpeed = function(brakeForce, gasPedalPosition, gasPedalForce) {
	// TODO
	return 0;
}

Game.prototype.onStringDataReceived = function(string) {
	console.log("Server message: " + message.data);
}

Game.prototype.onDraw = function() {
	if(this._state == GameState.MENU)
		this._drawMenu();
	else if(this._state == GameState.EXPERIMENT) {
		if(this._client.connectionEstablished())
	        this._client.send("Get data");
	   	this._drawScene();
	}
	else if(this._state == GameState.RESULT)
		this._drawResult();
}

Game.prototype._startMenu = function() {
	this._state = GameState.MENU;
	this._currentStateStartTime = new Date().getTime();
}

Game.prototype._startExperiment = function() {
	this._state = GameState.EXPERIMENT;
	this._currentStateStartTime = new Date().getTime();
}

Game.prototype._startResult = function() {
	this._state = GameState.RESULT;
	this._currentStateStartTime = new Date().getTime();
}

Game.prototype._drawScene = function() {
	this._driver.driveForward();

	if(this._experimentCompleted()) {
		this._fillLinePlot();
		this._linePlot.draw();
		this._addLinePlotToCanvas();
		this._linePlot.removeFromDOM();
		this._linePlot = null;
		this._startResult();
	}
}

Game.prototype._experimentCompleted = function() {
	var currentTime = new Date().getTime();
	var elapsedTime = (currentTime - this._currentStateStartTime)/1000;

	return elapsedTime/60 > 0.1;
}

Game.prototype._drawMenu = function() {
	// TODO: create menu
	// TODO: load objects during menu
	console.log('draw menu');
	this._startExperiment();
}

Game.prototype._drawResult = function() {
	console.log('draw result');
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
	plot.translate(0, 0, -1.5);
	plot.addToCanvas();
}

Game.prototype._addRoomToCanvas = function() {
	var cylinder = this._createCyclinder(400, 400, 200, 8, "track2/sky_full.png");
	cylinder.rotate(-Math.PI/2, 0, 0);
	cylinder.translate(0, 160, 0);
	cylinder.addToCanvas();

	var sky = this._createRectangle();
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

	linePlot.setNumDataSeries(3);
	linePlot.setTitle("Simulated Data");
	linePlot.setLegendNames(["Brake Force", "Gas Position", "Gas Force"]);
	linePlot.setXAxisTitle("Time Passed (in seconds)");
	linePlot.setYAxisTitle("Voltage");

	return linePlot;
}

Game.prototype._createCyclinder = function(width, height, depth, numSegments, image) {
	var xRadius = width/2;
	var yRadius = height/2;

	var xyz = [];
	var triangles = [];
	var uv = [];

	for(var i = 0; i < numSegments; i++) {
		xyz.push(xRadius*Math.cos((i + 1)*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin((i + 1)*2*Math.PI/numSegments));
		xyz.push(0);

		xyz.push(xRadius*Math.cos(i*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin(i*2*Math.PI/numSegments));
		xyz.push(0);

		xyz.push(xRadius*Math.cos((i + 1)*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin((i + 1)*2*Math.PI/numSegments));
		xyz.push(-depth);

		xyz.push(xRadius*Math.cos(i*2*Math.PI/numSegments));
		xyz.push(yRadius*Math.sin(i*2*Math.PI/numSegments));
		xyz.push(-depth);

		triangles.push.apply(triangles, [i*4,i*4+2,i*4+1, i*4+1,i*4+2,i*4+3]);
		uv.push.apply(uv, [0,1, 1,1, 0,0, 1,0]);
	}

	var cylinder = new DrawableObject(this._canvas);
	cylinder.setXYZ(xyz);
	cylinder.setTriangles(triangles);
	cylinder.setUV(uv);
	cylinder.setTexture(image);

	return cylinder;
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
