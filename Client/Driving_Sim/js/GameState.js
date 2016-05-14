// abstract class
function GameState(client, canvas, gameStateContext) {
	if(arguments.length < 3) return;

	this._client = client;
	this._canvas = canvas;
	this._context = gameStateContext;
	this._startTime = 0;
	this._eventHandlers = [];
	this._resources = [];
}

// abstract method
GameState.prototype.draw = function() {}

// abstract method
GameState.prototype.goToNextState = function() {}

GameState.prototype.addResource = function(name, drawable) {
	this._resources[name] = drawable;
}

GameState.prototype.getResource = function(name) {
	if(this._containsResource(name))
		return this._resources[name];
	return null;
}

GameState.prototype.removeResource = function(name) {
	if(this._containsResource(name))
		delete this._resources[name];
}

GameState.prototype.addEventHandler = function(eventType, eventHandlingFunction) {
	this._eventHandlers[eventType] = eventHandlingFunction;
	Global.EventDispatcher.addEventHandler(eventType, this._eventHandlers[eventType]);
}

GameState.prototype.removeEventHandler = function(eventType) {
	Global.EventDispatcher.removeEventHandler(eventType, this._eventHandlers[eventType]);
	if(this._handlesEventType(eventType))
		delete this._eventHandlers[eventType];
}

GameState.prototype._handlesEventType = function(eventType) {
	return this._eventHandlers.hasOwnProperty(eventType);
}

GameState.prototype._containsResource = function(resourceName) {
	return this._resources.hasOwnProperty(resourceName);
}

GameState.prototype.getStartTime = function() {
	return this._startTime;
}

GameState.prototype.hasStarted = function() {
	return this._startTime > 0;
}

GameState.prototype.start = function() {
	this.setStartTime(new Date().getTime());
}

GameState.prototype.setStartTime = function(startTime) {
	this._startTime = startTime;
}

GameState.prototype.getContext = function() {
	return this._context;
}

GameState.prototype.getClient = function() {
	return this._client;
}

GameState.prototype.getCanvas = function() {
	return this._canvas;
}
