function Driver(canvas) {
	if(arguments.length < 1) return;

	this._canvas = canvas;
	this._speed = 0;
}

Driver.prototype.changeSpeed = function(targetSpeed) { this._speed = (1 - 0.0001)*this._speed + 0.0001*targetSpeed; }

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

Driver.prototype.turnLeft = function() {
	this._canvas.rotate(0, -this._speed*5, 0);
}

Driver.prototype.turnRight = function() {
	this._canvas.rotate(0, this._speed*5, 0);
}
