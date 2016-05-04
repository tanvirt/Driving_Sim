function Driver(canvas) {
	if(arguments.length < 1) return;
	CompositeDrawable.call(this, canvas);

	this._canvas = canvas;
	this._speed = 0;

	this._speedometer = new DrawableObject(this._canvas);

	this._setup();
} Driver.prototype = new CompositeDrawable();

Driver.prototype._setup = function() {

}

Driver.prototype._getSpeedometerTexture = function(speed) {
	return this._createWhiteText(this._speed, 60).getTexture();
}

Driver.prototype._createWhiteText = function(string, height) {
	var text = new Text(this._canvas, string);
	text.setBackgroundColor("black");
	text.setTextColor("white");
	text.setTextHeight(height);
	text.enableSquareTexture();
	
	return text;
}

Driver.prototype._createRectangle = function(width, height, image) {
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

	var rectangle = new DrawableObject(this._canvas);
	rectangle.setXYZ(xyz);
	rectangle.setTriangles(triangles);
	rectangle.setUV(uv);
	rectangle.setTexture(image);

	return rectangle;
}

Driver.prototype._createCircle = function(width, height, numSegments) {

}

Driver.prototype.drawSetup = function() {
	this.setTexture(this._getSpeedometerTexture(this._speed));
}

Driver.prototype.getSpeed = function() { return this._speed; }

Driver.prototype.changeSpeed = function(intensity) {
	intensity = intensity * 2;
	var weight = 0.001;
	
	if(intensity < 0.3)
		weight = 0.005;
	
	this._speed = (1 - weight)*this._speed + weight*intensity;

	console.log(this._speed * 100);
}

Driver.prototype.brake = function(intensity) {
	this._speed = (1 - intensity)*this._speed;
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

Driver.prototype.turnLeft = function() {
	this._canvas.rotate(0, -this._speed*5, 0);
}

Driver.prototype.turnRight = function() {
	this._canvas.rotate(0, this._speed*5, 0);
}
