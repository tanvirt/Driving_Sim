function GameIntroState(client, canvas, gameStateContext) {
	if(arguments.length < 3) return;
	GameState.call(this, client, canvas, gameStateContext);

	this._setup();
} GameIntroState.prototype = new GameState();

GameIntroState.prototype._setup = function() {
	this.addEventHandler("arrayDataReceived", this._createArrayDataHandlingFunction());
	this.addEventHandler("startButtonClicked", this._createStartButtonClickHandlingFunction());

	this.addResource("startButton", this._createStartButton());
	this.getResource("startButton").addToCanvas();
}

GameIntroState.prototype._createStartButton = function() {
	var button = this._createRectangle(0.3, 0.1, this._createStartButtonTexture("Continue", 60));
	button.disablePicking(false);
	button.onTap = function(glEvent) {
		button.removeFromCanvas();
		var event = new Event("startButtonClicked", glEvent);
		Global.EventDispatcher.dispatch(event);
	}
	return button;
}

GameIntroState.prototype._createRectangle = function(width, height, image) {
	var halfWidth = width/2;
	var halfHeight = height/2;

	var yOffset = 0;
	var zOffset = -1;

	var xyz = [
		-halfWidth, halfHeight + yOffset, zOffset,
   		halfWidth, halfHeight + yOffset, zOffset,
   		-halfWidth, -halfHeight + yOffset, zOffset,
   		halfWidth, -halfHeight + yOffset, zOffset
   	];

   	var triangles = [0,2,1,	1,2,3];
   	var uv = [0,1, 1,1, 0,0, 1,0];

	var rectangle = new DrawableObject(this._canvas);
	rectangle.setXYZ(xyz);
	rectangle.setTriangles(triangles);
	rectangle.setUV(uv);
	rectangle.setTexture(image);

	return rectangle;
}

GameIntroState.prototype._createStartButtonTexture = function(string, height) {
	var text = new Text(this._canvas, string);
	text.setBackgroundColor("green");
	text.setTextColor("black");
	text.setTextHeight(height);
	
	return text.getTexture();
}

GameIntroState.prototype._createArrayDataHandlingFunction = function() {
	var self = this;
	return function(event) {
		var array = event.getData();
		// TODO: use array data for calibration
	}
}

GameIntroState.prototype._createStartButtonClickHandlingFunction = function() {
	var introState = this;
	return function(event) {
		introState.removeEventHandler("arrayDataReceived");

		var filePath = "track/hdri_sky.png";
		var hdriSphere = new HDRISphere(introState.getCanvas(), 35);
		hdriSphere.setTexture(filePath);
		introState.getCanvas().setHDRIRoom(hdriSphere);

		introState.setCanvasRoom();		

		introState.goToNextState();
	}
}

GameIntroState.prototype.setCanvasRoom = function() {
	var composition = new GLImageComposition(my_canvas);
	composition.filename = "http://localhost/webapps/Driving_Sim/track";

	composition.instructions = new Array();
	composition.textures = new Array();

	var cgiText = this._getCgiText();
	composition.handleLoadedFile(cgiText);
	
	this.getCanvas().setImageCompositionRoom(composition);
}

GameIntroState.prototype.draw = function() {
	if(this.getClient().connectionEstablished())
	    this.getClient().send("Get data");
}

GameIntroState.prototype.goToNextState = function() {
	this.getContext().setState(new GamePlayState(this.getClient(), this.getCanvas(), this.getContext()));
}

GameIntroState.prototype._getCgiText = function() {
	return "texture road1 Road1.bmp\n" +
		"texture road2 Road2.bmp\n" +
		"texture road3 Road3.bmp\n" +
		"texture road4 Road4.bmp\n" +
		"texture road5 Road5.bmp\n" +
		"texture grass grass.jpg\n" +
		"clearcolor 0 0 0\n" +
		"enable textures\n" +
		"color 1 1 1\n" +
		"pushMatrix\n" +
		"translate 0 -1 0\n" +
		"	pushMatrix\n" +
		"		translate 0 -1.5 0\n" +
		"		rotate -90 1 0 0\n" +
		"		bindtexture grass\n" +
		"		rectangle 200 4000 20 400\n" +
		"	popMatrix\n" +
		"	pushMatrix\n" +
		"		translate -8 -1.3 0\n" +
		"		rotate -90 1 0 0\n" +
		"		bindtexture road5\n" +
		"		rectangle 8 4000 1 100\n" +
		"	popMatrix\n" +
		"	pushMatrix\n" +
		"		translate 0 -1.3 0\n" +
		"		rotate -90 1 0 0\n" +
		"		bindtexture road4\n" +
		"		rectangle 8 4000 1 100\n" +
		"	popMatrix\n" +
		"popMatrix\n" +
		"disable textures\n";
}
