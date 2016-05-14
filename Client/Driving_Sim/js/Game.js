function Game(client, canvas) {
	this._stateContext = new GameStateContext(client, canvas);
	this._eventHandlers = [];

	this._setup();
}

Game.prototype._setup = function() {
	this._eventHandlers["onDrawFrame"] = this._createOnDrawEventHandlingFunction();
	Global.EventDispatcher.addEventHandler("onDrawFrame", this._eventHandlers["onDrawFrame"]);
}

Game.prototype._createOnDrawEventHandlingFunction = function() {
	var self = this;
	return function(event) {
		self._stateContext.draw();
	}
}
