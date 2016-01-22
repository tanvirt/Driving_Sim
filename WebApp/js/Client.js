function Client() {
	this.ws = null;
}

Client.prototype.connect = function() {
	if(!("WebSocket" in window)) {
		alert("ERROR: WebSocket is not supported by your browser.");
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
			//console.log("Client message: " + message);
		});
	}
	else
		console.log("ERROR: cannot send message. Connection has not been established.");
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
		console.log("ERROR: cannot disconnect. Connection was never established.");
};

Client.prototype.onopen = function() {
	console.log("Connection established");
};

Client.prototype.onmessage = function(message) {
	if(message.data instanceof Blob) {
		var fileReader = new FileReader();
		fileReader.onload = function() {
			var arrayBuffer = this.result;
			var data = new Float64Array(arrayBuffer);
			console.log("Blob data: " + data);
		}
		fileReader.readAsArrayBuffer(message.data);
	}
	else if(typeof message.data === "string")
		console.log("Server message: " + message.data);
	else
		console.log("ERROR: + \"" + message.data + "\" not recognized by client.")
};

Client.prototype.onerror = function(error) {
	console.log("ERROR: " + error);
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
