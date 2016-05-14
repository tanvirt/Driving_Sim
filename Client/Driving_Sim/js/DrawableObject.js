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

	this._animation = new Animation(this, function() {});
} DrawableObject.prototype = new GLObject();

DrawableObject.prototype.drawSetup = function() {
	this._animation.animate();
}

DrawableObject.prototype.setAnimation = function(animation) { this._animation = animation; }
DrawableObject.prototype.clearAnimation = function() { this._animation = new Animation(this, function() {}); }

DrawableObject.prototype.getId = function() { return this._id; }
DrawableObject.prototype.setId = function(id) { this._id = id; }

// DEV: should "ready to draw" be determined only by xyz coordinates?
DrawableObject.prototype.readyToDraw = function() {
	return 	this.buffers["aXYZ"] != undefined &&
			this.buffers["aXYZ"].data.length > 0;
}

DrawableObject.prototype.enableShading = function() { this.getShader().useLighting(true); }
DrawableObject.prototype.disableShading = function() { this.getShader().useLighting(false); }
DrawableObject.prototype.enableTexture = function() { this.getShader().useTexture(true); }
DrawableObject.prototype.disableTexture = function() { this.getShader().useTexture(false); }
DrawableObject.prototype.enableColors = function() { this.getShader().useColors(true); }
DrawableObject.prototype.disableColors = function() { this.getShader().useColors(false); }
DrawableObject.prototype.setColorMask = function(rgba) { this.getShader().setColorMask(rgba); }

DrawableObject.prototype.addToCanvas = function() { this._canvas.addDrawableObject(this); }
DrawableObject.prototype.removeFromCanvas = function() { this._canvas.removeDrawableObject(this); }

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

DrawableObject.prototype.rotate = function(thetaX, thetaY, thetaZ) {
	this._rotation[0] += thetaX;
	this._rotation[1] += thetaY;
	this._rotation[2] += thetaZ;
}

DrawableObject.prototype.setRotation = function(rotation) { this._rotation = rotation; }

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

DrawableObject.createRectangle = function(width, height, center, canvas) {
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

	var rectangle = new DrawableObject(canvas);
	rectangle.setXYZ(xyz);
	rectangle.setTriangles(triangles);
	rectangle.setUV(uv);

	return rectangle;
}

DrawableObject.createCircle = function(width, height, numSegments, color, center, canvas) {
	var xRadius = width/2;
	var yRadius = height/2;

	var xyz = [];
	var triangles = [];
	var colors = [];

	var xOffset = center[0]; //0;
	var yOffset = center[1]; //-0.55;
	var zOffset = center[2]; //-1.1;

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

	var circle = new DrawableObject(canvas);
	circle.setXYZ(xyz);
	circle.setTriangles(triangles);
	circle.setColors(colors);

	return circle;
}
