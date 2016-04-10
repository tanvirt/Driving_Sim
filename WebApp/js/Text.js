function Text(canvas, string) {
	this._gl = canvas.gl;
	this._string = string;
	
	this._canvas = null;
	this._texture = null;
	
	// Default text properties.
	this._maxWidth = 256;
	this._squareTexture = false;
	this._textHeight = 56;
	this._textAlignment = "center";
	this._textColor = "black";
	this._fontFamily = "monospace";
	this._backgroundColor = "blue";
	
	this._create();
}

Text.prototype.getTexture = function() { 
	this._create();
	return this._texture;
}

Text.prototype.setMaxWidth = function(width) {
	this._maxWidth = width;
}

Text.prototype.enableSquareTexture = function() {
	this._squareTexture = true;
}

Text.prototype.disableSquareTexture = function() {
	this._squareTexture = false;
}

Text.prototype.setTextHeight = function(height) {
	this._textHeight = height;
}

Text.prototype._setTextAlignment = function(alignment) {
	this._textAlignment = alignment;
}

Text.prototype.alignTextLeft = function() {
	this._setTextAlignment("left");
}

Text.prototype.alignTextCenter = function() {
	this._setTextAlignment("center");
}

Text.prototype.alignTextRight = function() {
	this._setTextAlignment("right");
}

Text.prototype.setTextColor = function(color) {
	this._textColor = color;
}

Text.prototype.setFontFamily = function(font) {
	this._fontFamily = font;
}

Text.prototype.setBackgroundColor = function(color) {
	this._backgroundColor = color;
}

Text.prototype._create = function() {
	this._createText();
	this._createTexture();
}

Text.prototype._createTexture = function() {
	var self = this;
	var gl = this._gl;
	this._texture = gl.createTexture();
	this._texture.use = function() {
		gl.bindTexture(gl.TEXTURE_2D, self._texture);
	}
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	gl.bindTexture(gl.TEXTURE_2D, this._texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._canvas);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	
	//gl.bindTexture(gl.TEXTURE_2D, null);
}

Text.prototype._createText = function() {
	this._canvas = document.createElement('canvas');
	
	var canvasX = null;
	var canvasY = null;
	var textX = null;
	var textY = null;
	
	var text = [];
	
	var context = this._canvas.getContext('2d');
	
	context.font = this._textHeight + "px " + this._fontFamily;
	if(this._maxWidth && this._measureText(context, this._string) > this._maxWidth ) {
		this._maxWidth = this._createMultilineText(context, this._string, this._maxWidth, text);
		canvasX = this._getPowerOfTwo(this._maxWidth);
	}
	else {
		text.push(this._string);
		canvasX = this._getPowerOfTwo(context.measureText(this._string).width);
	}
	canvasY = this._getPowerOfTwo(this._textHeight*(text.length + 1));
	if(this._squareTexture) {
		if(canvasX > canvasY)
			canvasY = canvasX;
		else
			canvasX = canvasY;
	}
	this._canvas.width = canvasX;
	this._canvas.height = canvasY;
	
	if(this._textAlignment == "left")
		textX = 0;
	else if(this._textAlignment == "center")
		textX = canvasX/2;
	else if(this._textAlignment == "right")
		textX = canvasX;
	
	textY = canvasY/2;
	
	context.fillStyle = this._backgroundColor;
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	
	context.fillStyle = this._textColor;
	context.textAlign = this._textAlignment;
	
	context.textBaseline = 'middle'; // top, middle, bottom
	context.font = this._textHeight + "px " + this._fontFamily;
	
	var offset = (canvasY - this._textHeight*(text.length + 1))/2;
	
	for(var i = 0; i < text.length; i++) {
		if(text.length > 1)
			textY = (i + 1)*this._textHeight + offset;
		context.fillText(text[i], textX,  textY);
	}
}

Text.prototype._createMultilineText = function(context, textToWrite, maxWidth, text) {
	var textToWrite = textToWrite.replace("\n"," ");
	var currentText = textToWrite;
	var futureText = null;
	var subWidth = 0;
	var maxLineWidth = 0;
	
	var wordArray = textToWrite.split(" ");
	var wordArrayLength = wordArray.length
	var wordsInCurrent = wordArrayLength;
	
	while(this._measureText(context, currentText) > maxWidth && wordsInCurrent > 1) {
		wordsInCurrent--;
		var linebreak = false;
		
		currentText = "";
		futureText = "";
		for(var i = 0; i < wordArrayLength; i++) {
			if(i < wordsInCurrent) {
				currentText += wordArray[i];
				if(i + 1 < wordsInCurrent)
					currentText += " ";
			}
			else {
				futureText += wordArray[i];
				if(i + 1 < wordArrayLength)
					futureText += " ";
			}
		}
	}
	text.push(currentText);
	maxLineWidth = this._measureText(context, currentText);
	
	if(futureText) {
		subWidth = this._createMultilineText(context, futureText, maxWidth, text);
		if(subWidth > maxLineWidth)
			maxLineWidth = subWidth;
	}
	
	return maxLineWidth;
}

Text.prototype._measureText = function(context, textToMeasure) {
	return context.measureText(textToMeasure).width;
}

Text.prototype._getPowerOfTwo = function(value, pow) {
	var pow = pow || 1;
	while(pow < value)
		pow *= 2;
	return pow;
}
