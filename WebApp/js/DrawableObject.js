function DrawableObject(canvas) {
	if(arguments.length < 1) return;
	GLObject.call(this, canvas);
	
	this._id = CanvasMath.generateUniqueString(10);
	this._canvas = canvas;
	this.disablePicking(true);
	
	this._rotation = [0, 0, 0];
	this._position = [0, 0, 0];
	this._scale = [1, 1, 1];
	
	this._lastMoved = new Date().getTime();
	this._velocity = 0;
	this._direction = [0, 0, 0];
} DrawableObject.prototype = new GLObject();

DrawableObject.prototype.getId = function() { return this._id; }

// DEV: should "ready to draw" be determined only by xyz coordinates?
DrawableObject.prototype.readyToDraw = function() {
	return 	this.buffers["aXYZ"] != undefined &&
			this.buffers["aXYZ"].data.length > 0;
}

DrawableObject.prototype.enableShading = function() {
	this.getShader().useLighting(true);
}

DrawableObject.prototype.disableShading = function() {
	this.getShader().useLighting(false);
}

DrawableObject.prototype.enableTexture = function() {
	this.getShader().useTexture(true);
}

DrawableObject.prototype.disableTexture = function() {
	this.getShader().useTexture(false);
}

DrawableObject.prototype.enableColors = function() {
	this.getShader().useColors(true);
}

DrawableObject.prototype.disableColors = function() {
	this.getShader().useColors(false);
}

DrawableObject.prototype.setColorMask = function(rgba) {
	this.getShader().setColorMask(rgba);
}

DrawableObject.prototype.addToCanvas = function() {
	this._canvas.addDrawableObject(this);
}

DrawableObject.prototype.removeFromCanvas = function() {
	this._canvas.removeDrawableObject(this);
}

DrawableObject.prototype.drawSetup = function() {} // hook operation

DrawableObject.prototype.getRotation = function() { return this._rotation; }
DrawableObject.prototype.getPosition = function() { return this._position; }
DrawableObject.prototype.getScale = function() { return this._scale; }
DrawableObject.prototype.getVelocity = function() {	return this._velocity; }
DrawableObject.prototype.getDirection = function() { return this._direction; }

DrawableObject.prototype.setPosition = function(xyz) {
	var changeInTime = new Date().getTime() - this._lastMoved;
	var vector = CanvasMath.createVec3(this._position, xyz);
	var magnitude = CanvasMath.getVec3Magnitude(vector);
	
	this._direction = CanvasMath.getDirectionVec3(vector, magnitude);
	this._velocity = (magnitude/changeInTime)*1000; // distance per second
	this._position = xyz;
	this._lastMoved = new Date().getTime();
}

DrawableObject.prototype.setRotation = function(thetas) {
	this._rotation = thetas;
}

DrawableObject.prototype.rotate = function(thetaX, thetaY, thetaZ) {
	this._rotation[0] += thetaX;
	this._rotation[1] += thetaY;
	this._rotation[2] += thetaZ;
	
	if(this._rotation[0] > 2*Math.PI)
		this._rotation[0] = 2*Math.PI - this._rotation[0];
	if(this._rotation[1] > 2*Math.PI)
		this._rotation[1] = 2*Math.PI - this._rotation[1];
	if(this._rotation[2] > 2*Math.PI)
		this._rotation[2] = 2*Math.PI - this._rotation[2];
}

DrawableObject.prototype.translate = function(x, y, z) {
	var xyz = [
		this._position[0] + x,
		this._position[1] + y,
		this._position[2] + z
	];
	
	this.setPosition(xyz);
}

DrawableObject.prototype.scale = function(width, height, depth) {
	this._scale[0] *= width;
	this._scale[1] *= height;
	this._scale[2] *= depth;
}
