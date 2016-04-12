function Track() {
	this._cgiText = "";
	this._currentAngle = 0;
	this._width = 0;
	this._depth = 0;

	this._road = [];
}

Track.prototype.addStraightRoad = function(numSegments) {
	// TODO
}

Track.prototype.addLeftTurn = function() {
	this._currentAngle -= 90;
}

Track.prototype.addRightTurn = function() {
	this._currentAngle += 90;
}

Track.prototype.getCgiText = function() {
	this._cgiText += this._getTextPrefix();
	// TODO: add rest of text
	this._cgiText += this._getTextSuffix();
}

Track.prototype._getTextPrefix = function() {
	return 
		"texture road1 Road1.bmp\n" +
		"texture road2 Road2.bmp\n" +
		"texture road3 Road3.bmp\n" +
		"texture road4 Road4.bmp\n" +
		"texture road5 Road5.bmp\n" +
		"texture grass grass2.jpg\n" +
		"clearcolor 0 0 0\n" +
		"enable textures\n" +
		"color 1 1 1\n" +
		"pushMatrix\n" +
		"translate 0 -1 0\n";
}

Track.prototype._getTextSuffix = function() {
	return 	
		"popMatrix\n" +
		"disable textures\n";
}
