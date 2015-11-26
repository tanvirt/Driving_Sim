function Canvas(elementId) {
	this.gl_canvas = new webGLcanvas(elementId);
	this.gl = this.gl_canvas.gl;
	this.canvas = this.gl_canvas.canvas;
	
	this.track = null;
	
	var self = this;
	this.gl_canvas.setup = function() { self.setup(); };
	this.gl_canvas.draw = function() { self.draw(); };
	
	this.gl_canvas.start();
}

Canvas.prototype.setTrack = function(filepath) {
	this.track = new webGLimageComposition(this.gl, filepath);
};

Canvas.prototype.setup = function() {
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);
	
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	
	this.view_changed = true;
	this.keys_pressed = false;
	
	this.rotation = {x: 0, y: 0, z: 0};
	this.translation = {x: 0, y: 0, z: 0};
	
	this.zoom = 1;
	
	this.translationSpeed = 0.1;
	this.rotationSpeed = 1;
};

Canvas.prototype.draw = function() {
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	this.updateMVMatrix();
	this.updatePMatrix();
	
	if(this.track)
		this.track.draw(this.pMatrix, this.mvMatrix);
};

Canvas.prototype.updateMVMatrix = function() {
	this.handleKeys();
	if(!this.view_changed && !this.keys_pressed)
		return;
	
	this.view_changed = false;
	mat4.identity(this.mvMatrix);
	
	mat4.rotate(this.mvMatrix, this.rotation.x, [1, 0, 0]);
	mat4.rotate(this.mvMatrix, this.rotation.y, [0, 1, 0]);
	mat4.rotate(this.mvMatrix, this.rotation.z, [0, 0, 1]);
	mat4.translate(this.mvMatrix, [this.translation.x, this.translation.y, this.translation.z]);
	mat4.scale(this.mvMatrix, [this.zoom, this.zoom, this.zoom]);
};

Canvas.prototype.updatePMatrix = function() {
	var realToCSSPixels = window.devicePixelRatio || 1;
	
	var displayWidth = Math.floor(this.canvas.clientWidth  * realToCSSPixels);
	var displayHeight = Math.floor(this.canvas.clientHeight * realToCSSPixels);
	
	if(this.canvas.width != displayWidth || this.canvas.height != displayHeight) {
		this.canvas.width  = displayWidth;
		this.canvas.height = displayHeight;
		
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.gl.viewportWidth = this.canvas.width;
		this.gl.viewportHeight = this.canvas.height;
		
		mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);
	}
};

Canvas.prototype.translate = function(x, y, z) {
	this.translation.x += x;
	this.translation.y += y;
	this.translation.z += z;
}

Canvas.prototype.rotate = function(x, y, z) {
	this.updateRotation();
	
	this.rotation.x += degToRad(x);
	this.rotation.y += degToRad(y);
	this.rotation.z += degToRad(z);
}

Canvas.prototype.updateRotation = function() {
	if(this.rotation.x >= 2*Math.PI || this.rotation.x < -2*Math.PI)
		this.rotation.x = 0;
	if(this.rotation.y >= 2*Math.PI || this.rotation.y < -2*Math.PI)
		this.rotation.y = 0;
	if(this.rotation.y >= 2*Math.PI || this.rotation.y < -2*Math.PI)
		this.rotation.z = 0;
}

var currentlyPressedKeys = {};

Canvas.prototype.handleKeys = function() {
	this.updateKeys();
	if(this.keys_pressed == false)
		return;
	
	if(this.leftArrowKeyIsPressed() && (this.upArrowKeyIsPressed() || this.downArrowKeyIsPressed()))
		this.rotate(0, -this.rotationSpeed, 0);
	if(this.upArrowKeyIsPressed())
		this.translate(-this.translationSpeed*Math.sin(this.rotation.y), 0, this.translationSpeed*Math.cos(this.rotation.y));
	if(this.rightArrowKeyIsPressed() && (this.upArrowKeyIsPressed() || this.downArrowKeyIsPressed()))
		this.rotate(0, this.rotationSpeed, 0);
	if(this.downArrowKeyIsPressed())
		this.translate(this.translationSpeed*Math.sin(this.rotation.y), 0, -this.translationSpeed*Math.cos(this.rotation.y));
}

Canvas.prototype.updateKeys = function() {
	if(this.leftArrowKeyIsPressed() ||
			this.upArrowKeyIsPressed() ||
			this.rightArrowKeyIsPressed() ||
			this.downArrowKeyIsPressed())
		this.keys_pressed = true;
	else
		this.keys_pressed = false;
}

Canvas.prototype.handleKeyDown = function(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

Canvas.prototype.handleKeyUp = function(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

Canvas.prototype.leftArrowKeyIsPressed = function() {
	return currentlyPressedKeys[37] == true;
}

Canvas.prototype.upArrowKeyIsPressed = function() {
	return currentlyPressedKeys[38] == true;
}

Canvas.prototype.rightArrowKeyIsPressed = function() {
	return currentlyPressedKeys[39] == true;
}

Canvas.prototype.downArrowKeyIsPressed = function() {
	return currentlyPressedKeys[40] == true;
}
