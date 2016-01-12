function Client() {
	this.ws = null;
}

Client.prototype.connect = function() {
	if(!("WebSocket" in window)) {
		alert("WebSocket is not supported by your browser");
		return;
	}
	
    this.ws = new WebSocket("ws://localhost:9002");
	
	var self = this;
	
	this.ws.onopen = function() {
		self.onopen();
	};
    this.ws.onmessage = function(message) {
		self.onmessage(message);
	};
    this.ws.onclose = function() { 
		self.onclose();
		self.ws = null;
	};
	this.ws.onerror = function(error) {
		self.onerror(error);
	};
};

Client.prototype.send = function(message) {
	var self = this;
	if(self.ws != null) {
		this.waitForSocketConnection(function() {
			self.ws.send(message);
			console.log("Client message: " + message);
		});
	}
	else
		console.log("Cannot send message: connection has not been established");
};

Client.prototype.disconnect = function() {
	var self = this;
	if(self.ws != null) {
		this.waitForSocketConnection(function() {
			self.ws.close();
			self.ws = null;
		});
	}
	else
		console.log("Cannot close WebSocket: connection was never established");
};

Client.prototype.onopen = function() {
	console.log("Connection established");
};

Client.prototype.onmessage = function(message) {
	console.log("Server message: " + message.data);
};

Client.prototype.onerror = function(error) {
	console.log("Error: " + error);
};

Client.prototype.onclose = function() {
	console.log("Connection closed");
};

Client.prototype.waitForSocketConnection = function(callback) {
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
	                self.waitForSocketConnection(callback);
	        }, 
			5 // wait 5 milliseconds for the connection
	);
};

Client.prototype.connectionIsOpen = function() {
	if(this.ws == null)
		return false;
	return this.ws.readyState === 1;
}

Client.prototype.connectionIsClosed = function() {
	if(this.ws == null)
		return true;
	return this.ws.readyState === 3;
}
