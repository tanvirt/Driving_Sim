function Driver(canvas) {
	if(arguments.length < 1) return;

	this._canvas = canvas;
	this._speed = 0;

	this._speedometer = new DrawableObject(this._canvas);

	this._resources = [];

	this._setup();
}

Driver.prototype.getPosition = function() {
	return this._canvas.getCameraPosition();
}

Driver.prototype._setup = function() {
	this._loadResources();

	Global.EventDispatcher.addEventHandler("distanceOutsideBounds", this._createDistanceOutsideHandlingFunction());
	Global.EventDispatcher.addEventHandler("distanceInsideBounds", this._createDistanceInsideHandlingFunction());
}

Driver.prototype._createDistanceOutsideHandlingFunction = function() {
	var driver = this;
	return function(event) {
		var distanceIndicator = driver._resources["distanceIndicator"];
		distanceIndicator.setColorMask([1, 0, 0, 1]);
	}
}

Driver.prototype._createDistanceInsideHandlingFunction = function() {
	var driver = this;
	return function(event) {
		var distanceIndicator = driver._resources["distanceIndicator"];
		distanceIndicator.setColorMask([0, 1, 0, 1]);
	}
}

Driver.prototype._loadResources = function() {
	this._resources["speedScreen"] = this._createSpeedScreen();
	var speedScreen = this._resources["speedScreen"];
	var speedScreenAnimation = new Animation(speedScreen, this._createSpeedScreenAnimationFunction());
	speedScreen.setAnimation(speedScreenAnimation);

	this._resources["dashboard"] = this._createDashboard();
	var dashboard = this._resources["dashboard"];
	var dashboardAnimation = new Animation(dashboard, this._createDashboardAnimationFunction());
	dashboard.setAnimation(dashboardAnimation);

	this._resources["distanceIndicator"] = this._createDistanceIndicator();
	var distanceIndicator = this._resources["distanceIndicator"];
	var distanceIndicatorAnimation = new Animation(distanceIndicator, this._createDistanceIndicatorAnimationFunction());
	distanceIndicator.setAnimation(distanceIndicatorAnimation);
}

Driver.prototype._createSpeedScreenAnimationFunction = function() {
	var driver = this;
	return function(speedScreen) {
		speedScreen.setTexture(driver._getSpeedometerTexture());
		driver._moveDrawbleWithCamera(speedScreen);
	}
}

Driver.prototype._createDashboardAnimationFunction = function() {
	var driver = this;
	return function(dashBoard) {
		driver._moveDrawbleWithCamera(dashBoard);
	}
}

Driver.prototype._createDistanceIndicatorAnimationFunction = function() {
	var driver = this;
	return function(indicator) {
		driver._moveDrawbleWithCamera(indicator);
	}
}

Driver.prototype._moveDrawbleWithCamera = function(drawable) {
	drawable.setPosition(drawable._canvas.getCameraPosition());
	drawable.setRotation(drawable._canvas.getCameraRotation());
}

Driver.prototype._createDashboard = function() {
	var color = [0.4, 0.4, 0.4];
	var center = [0, -0.55, -1.1];
	var dashBoard = DrawableObject.createCircle(1.5, 0.75, 100, color, center, this._canvas);
	dashBoard.setPosition(dashBoard._canvas.getCameraPosition());

	return dashBoard;
}

Driver.prototype._createDistanceIndicator = function() {
	var color = [1, 1, 1];
	var center = [0.2, -0.25, -1];
	var indicator = DrawableObject.createCircle(0.05, 0.05, 100, color, center, this._canvas);
	indicator.setPosition(indicator._canvas.getCameraPosition());

	return indicator;
}

Driver.prototype._createSpeedScreen = function() {
	var center = [0, -0.3, -1];
	var speedScreen = DrawableObject.createRectangle(0.2, 0.2, center, this._canvas);
	speedScreen.setTexture(this._getSpeedometerTexture());
	speedScreen.setPosition(speedScreen._canvas.getCameraPosition());

	return speedScreen;
}

Driver.prototype._createCyclinder = function(width, height, depth, numSegments, center) {
	var xRadius = width/2;
	var yRadius = height/2;

	var xyz = [];
	var triangles = [];
	var uv = [];

	for(var i = 0; i < numSegments; i++) {
		xyz.push( (xRadius*Math.cos((i + 1)*2*Math.PI/numSegments)) + center[0] );
		xyz.push( (yRadius*Math.sin((i + 1)*2*Math.PI/numSegments)) + center[1] );
		xyz.push(0 + center[2]);

		xyz.push( (xRadius*Math.cos(i*2*Math.PI/numSegments)) + center[0] );
		xyz.push( (yRadius*Math.sin(i*2*Math.PI/numSegments)) + center[1] );
		xyz.push(0 + center[2]);

		xyz.push( (xRadius*Math.cos((i + 1)*2*Math.PI/numSegments)) + center[0] );
		xyz.push( (yRadius*Math.sin((i + 1)*2*Math.PI/numSegments)) + center[1] );
		xyz.push(-depth + center[2]);

		xyz.push( (xRadius*Math.cos(i*2*Math.PI/numSegments)) + center[0] );
		xyz.push( (yRadius*Math.sin(i*2*Math.PI/numSegments)) + center[1] );
		xyz.push(-depth + center[2]);

		triangles.push.apply(triangles, [i*4, i*4 + 2, i*4 + 1, i*4 + 1, i*4 + 2, i*4 + 3]);
		uv.push.apply(uv, [0,1, 1,1, 0,0, 1,0]);
	}

	var cylinder = new DrawableObject(this._canvas);
	cylinder.setXYZ(xyz);
	cylinder.setTriangles(triangles);
	cylinder.setUV(uv);

	return cylinder;
}

Driver.prototype.addToCanvas = function() {
	for(var drawableName in this._resources)
		this._resources[drawableName].addToCanvas();
}

Driver.prototype.removeFromCanvas = function() {
	for(var drawableName in this._resources)
		this._resources[drawableName].removeFromCanvas();
}

Driver.prototype._getSpeedometerTexture = function() {
	return this._createWhiteText(Math.floor(this._speed * 100), 60).getTexture();
}

Driver.prototype._createWhiteText = function(string, height) {
	var text = new Text(this._canvas, string);
	text.setBackgroundColor("black");
	text.setTextColor("white");
	text.setTextHeight(height);
	text.enableSquareTexture();
	
	return text;
}

Driver.prototype._createRectangle = function(width, height, center) {
	var halfWidth = width/2;
	var halfHeight = height/2;

	var xOffset = center[0];
	var yOffset = center[1];
	var zOffset = center[2];

	var xyz = [
		-halfWidth + xOffset, halfHeight + yOffset, zOffset,
   		halfWidth + xOffset, halfHeight + yOffset, zOffset,
   		-halfWidth + xOffset, -halfHeight + yOffset, zOffset,
   		halfWidth + xOffset, -halfHeight + yOffset, zOffset
   	];

   	var triangles = [0,2,1,	1,2,3];
   	var uv = [0,1, 1,1, 0,0, 1,0];

	var rectangle = new DrawableObject(this._canvas);
	rectangle.setXYZ(xyz);
	rectangle.setTriangles(triangles);
	rectangle.setUV(uv);

	return rectangle;
}

Driver.prototype._createCircle = function(width, height, numSegments, color, center) {
	var xRadius = width/2;
	var yRadius = height/2;

	var xyz = [];
	var triangles = [];
	var colors = [];

	var xOffset = center[0];
	var yOffset = center[1];
	var zOffset = center[2];

	for(var i = 0; i < numSegments; i++) {
		xyz.push(xRadius*Math.cos((i + 1)*2*Math.PI/numSegments) + xOffset);
		xyz.push(yRadius*Math.sin((i + 1)*2*Math.PI/numSegments) + yOffset);
		xyz.push(zOffset);

		xyz.push(xRadius*Math.cos(i*2*Math.PI/numSegments) + xOffset);
		xyz.push(yRadius*Math.sin(i*2*Math.PI/numSegments) + yOffset);
		xyz.push(zOffset);

		xyz.push(xOffset);
		xyz.push(yOffset);
		xyz.push(zOffset);

		triangles.push.apply(triangles, [i*3, i*3 + 1, i*3 + 2]);
		for(var j = 0; j < 3; j++)
			colors.push.apply(colors, color);
	}

	var circle = new DrawableObject(this._canvas);
	circle.setXYZ(xyz);
	circle.setTriangles(triangles);
	circle.setColors(colors);

	return circle;
}

Driver.prototype.getSpeed = function() { return this._speed; }

Driver.prototype.changeSpeed = function(intensity) {
	var weight = 0.001;
	var newSpeed = intensity*2;

	this._speed = (1 - weight)*this._speed + weight*newSpeed;
}

Driver.prototype.brake = function(intensity) {
	if(intensity < 0.05)
		return;

	var weight = (1 - Math.min(this._speed, 0.3))/10;

	this._speed = (1 - intensity*weight)*this._speed;
}

Driver.prototype.driveForward = function() {
	var rotation = this._canvas.getRotation();
	this._canvas.translate(
		-this._speed*Math.sin(rotation[1]),
		0,
		this._speed*Math.cos(rotation[1])
	);
}

Driver.prototype.driveBackward = function() {
	var rotation = this._canvas.getRotation();
	this._canvas.translate(
        this._speed*Math.sin(rotation[1]),
        0,
        -this._speed*Math.cos(rotation[1])
    );
}

Driver.prototype.turn = function(intensity) {
	var turningIntensity = intensity*2 - 1;
	if(turningIntensity <= 0.05 && turningIntensity >= -0.05)
		turningIntensity = 0;

	var turningScale = 3;
	var turningSpeed = this._speed*turningScale*turningIntensity;
	this._canvas.rotate(0, turningSpeed, 0);
}
