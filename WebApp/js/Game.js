// Game implements the MessageListener and DrawListener interfaces

function Game(client, canvas) {
	this._client = client;
	this._canvas = canvas;

	this._state = GameState.CONSTRUCTED;

	this._driver = new Driver(this._canvas);

	this._walls = null;
	this._roof = null;

	this._result = null;

	this._currentStateStartTime = 0;
	this._experimentStartTime = 0;

	this._times = [];		// DEV: this is temporary
	this._samples = [];		// DEV: this is temporary

	this._positions = [];	// DEV: this is temporary
	this._rotations = [];	// DEV: this is temporary

	this._setup();
}

Game.prototype.getCanvas = function() { return this._canvas; }
Game.prototype.getSamples = function() { return this._samples; }
Game.prototype.getTimes = function() { return this._times; }
Game.prototype.getPositions = function() { return this._positions; }
Game.prototype.getRotations = function() { return this._rotations; }

Game.prototype._setup = function() {
	this._canvas.setPosition(0, 0, -450);
	this._canvas.addDrawListener(this);
	this._addRoomToCanvas();
	this._client.addMessageListener(this);
}

Game.prototype.onArrayDataReceived = function(array) {
	var currentTime = new Date().getTime();
	var elapsedTime = (currentTime - this._experimentStartTime)/1000;

	this._updateDriverSpeed(array);

	this._times.push(elapsedTime);
	this._samples.push(array);
}

Game.prototype._updateDriverSpeed = function(array) {
	var brakeForce = array[0];
	var gasPedalPosition = array[1];
	var gasPedalForce = array[2];

	var speed = this._convertToSpeed(gasPedalPosition, gasPedalForce);
	this._driver.changeSpeed(speed);

	var brakeIntensity = this._convertToIntensity(brakeForce);
	this._driver.brake(brakeIntensity);
}

Game.prototype._convertToSpeed = function(gasPedalPosition, gasPedalForce) {
	// TODO
	//var intensity = this._getScaledValue(gasPedalPosition, 3.29, 0.89);
	//return intensity*100;
	
	return 5;
}

Game.prototype._convertToIntensity = function(brakeForce) {
	// TODO
	//var intensity = this._getScaledValue(brakeForce, 4.0, -0.33);
	//return intensity;

	return 0;
}

// returns a value between 0 and 1
Game.prototype._getScaledValue = function(oldValue, oldMax, oldMin) {
	var oldRange = oldMax - oldMin;
	var newValue = (oldValue - oldMin)/oldRange;

	if(newValue > 1)
		return 1;
	if(newValue < 0)
		return 0;

	return newValue;
}

Game.prototype.onStringDataReceived = function(string) {
	console.log("Server message: " + message.data);
}

Game.prototype.onDraw = function() {
	if(this._state == GameState.CONSTRUCTED)
		this._startMenu();
	if(this._state == GameState.MENU)
		this._drawMenu();
	else if(this._state == GameState.EXPERIMENT) {
		if(this._client.connectionEstablished())
	        this._client.send("Get data");
	   	this._drawScene();
	}
	else if(this._state == GameState.RESULT)
		this._result.draw();
}

Game.prototype._startMenu = function() {
	this._state = GameState.MENU;
	this._currentStateStartTime = new Date().getTime();
}

Game.prototype._startExperiment = function() {
	this._state = GameState.EXPERIMENT;
	this._currentStateStartTime = new Date().getTime();
	this._experimentStartTime = new Date().getTime();
}

Game.prototype._startResult = function() {
	this._state = GameState.RESULT;
	this._currentStateStartTime = new Date().getTime();
	this._result = new GameResult(this);
	this._walls.removeFromCanvas();
}

Game.prototype._endGame = function() {
	this._state = GameState.FINISHED;
	this._currentStateStartTime = new Date().getTime();
}

Game.prototype._drawScene = function() {
	this._positions.push(this._canvas.getPosition());
	this._rotations.push(this._canvas.getRotation());

	this._driver.driveForward();

	if(this._experimentCompleted())
		this._startResult();
}

Game.prototype._experimentCompleted = function() {
	//var currentTime = new Date().getTime();
	//var elapsedTime = (currentTime - this._currentStateStartTime)/1000;
	//return elapsedTime/60 > 0.3;

	return this._canvas.getPosition()[2] >= 450;
}

Game.prototype._drawMenu = function() {
	// TODO: create menu
	// TODO: load objects during menu
	console.log('draw menu');
	this._startExperiment();
}

Game.prototype._addRoomToCanvas = function() {
	var cylinder = this._createCyclinder(1000, 1000, 500, 12, "track2/sky_full.png");
	cylinder.rotate(-Math.PI/2, 0, 0);
	cylinder.translate(0, 400, 0);
	cylinder.addToCanvas();

	this._walls = cylinder;
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
