function DrawableList(camera) {
	this._camera = camera;
	this._graphicList = [];
}

DrawableList.prototype.add = function(drawableObject) {
	this._graphicList[drawableObject.getId()] = drawableObject;
}

DrawableList.prototype.remove = function(drawableObject) {
	if(drawableObject.getId() in this._graphicList)
		delete this._graphicList[drawableObject.getId()];
}

DrawableList.prototype.getObject = function(objectId) {
	if(objectId in this._graphicList)
		return this._graphicList[objectId];
	else
		return null;
}

DrawableList.prototype.draw = function() {
	for(var key in this._graphicList) {
		if(!this._graphicList.hasOwnProperty(key))
			return;
		var graphic = this._graphicList[key];
		graphic.drawSetup();
		if(graphic.readyToDraw())
			this._drawGraphic(graphic);
	}
}

DrawableList.prototype._drawGraphic = function(graphic) {
	this._camera.pushMatrix();
		this._rotateGraphic(graphic);
		this._scaleGraphic(graphic);
		this._positionGraphic(graphic);
		graphic.updateShader();
		graphic.draw();
	this._camera.popMatrix();
}

DrawableList.prototype._rotateGraphic = function(graphic) {
	var position = graphic.getPosition();
	var rotation = graphic.getRotation();
	
	this._camera.translate(position);
	this._camera.rotate(rotation[0], [1, 0, 0]);
	this._camera.rotate(rotation[1], [0, 1, 0]);
	this._camera.rotate(rotation[2], [0, 0, 1]);
	this._camera.translate([-position[0], -position[1], -position[2]]);
}

DrawableList.prototype._scaleGraphic = function(graphic) {
	this._camera.scale(graphic.getScale());
}

DrawableList.prototype._positionGraphic = function(graphic) {
	this._camera.translate(graphic.getPosition());
}
