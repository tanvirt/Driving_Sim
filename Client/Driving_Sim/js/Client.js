function Client(url) {
	this._socket = null;
	this.connect(url);
}

Client.prototype.connect = function(url) {
	if(!("WebSocket" in window)) {
		alert("ERROR: WebSocket is not supported by your browser.");
		return;
	}
	if(this._socket != null) {
		console.log("ERROR: connection has already been established. Must diconnect before connecting.");
		return;
	}
	
    this._socket = new WebSocket("ws://localhost:9002");
	
	var self = this;
	this._socket.onopen = function() {
		self._onopen();
	};
    this._socket.onmessage = function(message) {
		self._onmessage(message);
	};
    this._socket.onclose = function() { 
		self._onclose();
		self._ws = null;
	};
	this._socket.onerror = function(error) {
		self._onerror(error);
	};
};

Client.prototype.send = function(message) {
	var self = this;
	if(this._socket != null) {
		this._waitForSocketConnection(function() {
			self._socket.send(message);
			//console.log("Client message: " + message);
		});
	}
	else
		console.log("ERROR: cannot send message. Connection has not been established.");
};

Client.prototype.disconnect = function() {
	var self = this;
	if(self._socket != null) {
		this._waitForSocketConnection(function() {
			self._socket.close();
			self._socket = null;
		});
	}
	else
		console.log("ERROR: cannot disconnect. Connection was never established.");
};

Client.prototype.connectionEstablished = function() {
	return this._socket != null;
}

Client.prototype.connectionIsOpen = function() {
	if(!this.connectionEstablished())
		return false;
	return this._socket.readyState === 1;
}

Client.prototype.connectionIsClosed = function() {
	if(!this.connectionEstablished())
		return true;
	return this._socket.readyState === 3;
}

Client.prototype._onopen = function() {
	console.log("Connection established");
};

Client.prototype._onmessage = function(message) {
	var self = this;
	if(message.data instanceof Blob) {
		var fileReader = new FileReader();
		fileReader.onload = function() {
			var arrayBuffer = this.result;
			var array = new Float64Array(arrayBuffer);
			var event = new Event("arrayDataReceived", array);
			Global.EventDispatcher.dispatch(event);
		}
		fileReader.readAsArrayBuffer(message.data);
	}
	else if(typeof message.data === "string") {
		var event = new Event("stringDataReceived", message.data);
		Global.EventDispatcher.dispatch(event);
	}
	else
		console.log("ERROR: + \"" + message.data + "\" not recognized by client.");
};

Client.prototype._onerror = function(error) {
	console.log("ERROR: " + error);
};

Client.prototype._onclose = function() {
	console.log("Connection closed");
};

Client.prototype._waitForSocketConnection = function(callback) {
	var self = this;
	setTimeout(
        function() {
            if(self.connectionIsOpen()) {
                if(callback != null)
                    callback();
                return;
            }
			else if(self.connectionIsClosed())
				return;
			else
                self._waitForSocketConnection(callback);
        }, 
		5 // wait 5 milliseconds for the connection
	);
};
