function Canvas(client, elementId) {
    if(elementId == undefined)
        GLCanvas.call(this, this._createCanvasContainerElement().id);
    else
        GLCanvas.call(this, elementId);
    
    this._client = client;
    
    this._drawableList = new DrawableList(this.getCamera());

    this._hdriRoom = null;
    this._imageCompositionRoom = null
    
    this._rotation = [0, 0, 0];
    this._translation = [0, 0, 0];
    
    this._translationSpeed = 0.4;
    this._rotationSpeed = 2;
    
    this._currentlyPressedKeys = {};

    this._onDrawEvent = new Event("onDrawFrame", null);
    
    this.start();
} Canvas.prototype = new GLCanvas();

Canvas.prototype.setHDRIRoom = function(hdriRoom) {
    this._hdriRoom = hdriRoom;
}

Canvas.prototype.setImageCompositionRoom = function(imageCompositionRoom) {
    this._imageCompositionRoom = imageCompositionRoom;
}

Canvas.prototype.addDrawableObject = function(drawableObject) {
    this._drawableList.add(drawableObject);
}

Canvas.prototype.removeDrawableObject = function(drawableObject) {
    this._drawableList.remove(drawableObject);
}

Canvas.prototype.onSetup = function() {
    var self = this;
    this.getDiv().ondblclick = function() {
        self._requestFullScreen(document.body);
    }
    this.getDiv().ontouchend = function() {
        self._requestFullScreen(document.body);
    }
    this.setBackgroundColor(0, 0, 0);
    this.setLoadingStatus(false);
    
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
}

Canvas.prototype.onDraw = function() {
    var gl = this.getGL();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this._updateCamera();

    if(this._hdriRoom != null)
        this._hdriRoom.draw();
    if(this._imageCompositionRoom != null)
        this._imageCompositionRoom.draw();

    this._drawableList.draw();

    Global.EventDispatcher.dispatch(this._onDrawEvent);
}

Canvas.prototype.translate = function(x, y, z) {
    this._translation[0] += x;
    this._translation[1] += y;
    this._translation[2] += z;
}

Canvas.prototype.rotate = function(x, y, z) {
    this._updateRotation();
    this._rotation[0] += degToRad(x);
    this._rotation[1] += degToRad(y);
    this._rotation[2] += degToRad(z);
}

Canvas.prototype.getCameraPosition = function() {
    var position = this._translation.slice();
    position[2] *= -1;
    return position;
}

Canvas.prototype.getPosition = function() { return this._translation.slice(); }
Canvas.prototype.getRotation = function() { return this._rotation.slice(); }

Canvas.prototype.getCameraPosition = function() {
    var position = this.getPosition();
    position[0] *= -1;
    position[1] *= -1;
    position[2] *= -1;

    return position;
}

Canvas.prototype.getCameraRotation = function() {
    var rotation = this.getRotation();
    rotation[0] *= -1;
    rotation[1] *= -1;
    rotation[2] *= -1;

    return rotation;
}

Canvas.prototype.setPosition = function(x, y, z) { 
    this._translation[0] = x;
    this._translation[1] = y;
    this._translation[2] = z;
}

Canvas.prototype.setRotation = function(x, y, z) {
    this._rotation[0] = x;
    this._rotation[1] = y;
    this._rotation[2] = z;
}

Canvas.prototype._updateCamera = function() {
    this.handleKeys();
    this.getCamera().rotateX(this._rotation[0]);
    this.getCamera().rotateY(this._rotation[1]);
    this.getCamera().rotateZ(this._rotation[2]);
    this.getCamera().translate([this._translation[0], this._translation[1], this._translation[2]]);
};

Canvas.prototype._updateRotation = function() {
    if(this._rotation[0] >= 2*Math.PI || this._rotation[0] < -2*Math.PI)
        this._rotation[0] = 0;
    if(this._rotation[1] >= 2*Math.PI || this._rotation[1] < -2*Math.PI)
        this._rotation[1] = 0;
    if(this._rotation[2] >= 2*Math.PI || this._rotation[2] < -2*Math.PI)
        this._rotation[2] = 0;
}

Canvas.prototype._createCanvasContainerElement = function() {
    var container = document.createElement("DIV");
    
    container.id = "canvas_container";
    container.style.position = "absolute";
    container.style.width = "100%";
    container.style.top = "0px";
    container.style.bottom = "0px";
    container.style.right = "0px";
    
    document.body.appendChild(container);
    
    return container;
}

Canvas.prototype._requestFullScreen = function(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || 
        element.webkitRequestFullScreen || 
        element.mozRequestFullScreen || 
        element.msRequestFullscreen;
    
    if(requestMethod) // Native full screen.
        requestMethod.call(element);
    else if(window.ActiveXObject == undefined) { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if(wscript !== null)
            wscript.SendKeys("{F11}");
    }
}

Canvas.prototype.handleKeyUp = function(event) {
    event.preventDefault();
    this._currentlyPressedKeys[event.keyCode] = false;
}

Canvas.prototype.handleKeyDown = function(event) {
    event.preventDefault();
    this._currentlyPressedKeys[event.keyCode] = true;
    if(event.keyCode === 49)
        this.useRegularProjector();
    else if(event.keyCode === 50)
        this.useRedCyanProjector();
    else if(event.keyCode === 51)
        this.useOculusProjector();
    else if(event.keyCode === 52)
        this.useSideBySideProjector();
}

Canvas.prototype.handleKeys = function() {
    if(!this._keysPressed())
        return;
    
    if(this._turningLeft())
        this._rotateLeft();
    if(this._turningRight())
        this._rotateRight();

    if(this._drivingForward())
        this._translateForward();
    if(this._drivingBackward())
        this._translateBackward();
}

Canvas.prototype._keysPressed = function() {
    return  this._leftArrowKeyIsPressed() ||
            this._upArrowKeyIsPressed() ||
            this._rightArrowKeyIsPressed() ||
            this._downArrowKeyIsPressed();
}

Canvas.prototype._turningLeft = function() {
    return  this._leftArrowKeyIsPressed() && 
            (this._upArrowKeyIsPressed() || this._downArrowKeyIsPressed());
}

Canvas.prototype._turningRight = function() {
    return  this._rightArrowKeyIsPressed() && 
            (this._upArrowKeyIsPressed() || this._downArrowKeyIsPressed());
}

Canvas.prototype._drivingForward = function() {
    return this._upArrowKeyIsPressed();
}

Canvas.prototype._drivingBackward = function() {
    return this._downArrowKeyIsPressed();
}

Canvas.prototype._rotateLeft = function() {
    this.rotate(0, -this._rotationSpeed, 0);
}

Canvas.prototype._rotateRight = function() {
    this.rotate(0, this._rotationSpeed, 0);
}

Canvas.prototype._translateForward = function() {
    this.translate(
        -this._translationSpeed*Math.sin(this._rotation[1]), 
        0, 
        this._translationSpeed*Math.cos(this._rotation[1])
    );
}

Canvas.prototype._translateBackward = function() {
    this.translate(
        this._translationSpeed*Math.sin(this._rotation[1]), 
        0, 
        -this._translationSpeed*Math.cos(this._rotation[1])
    );
}

Canvas.prototype._leftArrowKeyIsPressed = function() {
    return this._currentlyPressedKeys[37] == true;
}

Canvas.prototype._upArrowKeyIsPressed = function() {
    return this._currentlyPressedKeys[38] == true;
}

Canvas.prototype._rightArrowKeyIsPressed = function() {
    return this._currentlyPressedKeys[39] == true;
}

Canvas.prototype._downArrowKeyIsPressed = function() {
    return this._currentlyPressedKeys[40] == true;
}
