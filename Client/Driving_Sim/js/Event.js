function Event(type, data) {
	this._type = type;
	this._data = data;
}

Event.prototype.getType = function() { return this._type; }
Event.prototype.getData = function() { return this._data; }
