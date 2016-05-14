function EventDispatcher() {
	this._eventBins = [];
}

EventDispatcher.prototype.dispatch = function(event) {
	var eventType = event.getType();
	if(this._containsEventType(eventType)) {
		var eventBin = this._eventBins[eventType];
		for(var i = 0; i < eventBin.length; i++)
			eventBin[i](event);
	}
}

EventDispatcher.prototype.addEventHandler = function(eventType, eventHandlingFunction) {
	if(!this._containsEventType(eventType))
		this._eventBins[eventType] = [];
	this._eventBins[eventType].push(eventHandlingFunction);
}

EventDispatcher.prototype.removeEventHandler = function(eventType, eventHandlingFunction) {
	if(this._containsEventType(eventType)) {
		var eventBin = this._eventBins[eventType];
		var index = eventBin.indexOf(eventHandlingFunction);
		if(index > -1)
			eventBin.splice(index, 1);
		if(eventBin.length == 0)
			delete eventBin;
	}
}

EventDispatcher.prototype._containsEventType = function(eventType) {
	return this._eventBins.hasOwnProperty(eventType);
}
