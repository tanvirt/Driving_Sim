function Animation(drawableObject, animationFunction) {
	this._drawableObject = drawableObject;
	this._animationFunction = animationFunction;
}

Animation.prototype.animate = function() {
	this._animationFunction(this._drawableObject);
}
