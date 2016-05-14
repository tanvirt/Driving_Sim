function GamePlayState(client, canvas, gameStateContext) {
	if(arguments.length < 3) return;
	GameState.call(this, client, canvas, gameStateContext);

	this._positions = [];	// DEV: this is temporary
	this._rotations = [];	// DEV: this is temporary

	this._times = [];		// DEV: this is temporary
	this._samples = [];		// DEV: this is temporary
	
	this._driver = null;

	this._result = null;

	this._rawDataCSV = null;
	this._laneDeviationCSV = null;

	this._distanceCSV = null;

	this._resources = [];

	this._setup();
} GamePlayState.prototype = new GameState();

GamePlayState.prototype._createCar = function() {
	var car = new CompositeDrawable(this.getCanvas());
	car.loadOBJMTL('obj/Model_Car/', 'Model.mtl', 'Model.obj', 'Model.png');
	car.translate(0, -2.4, 0);

	return car;
}

GamePlayState.prototype._setup = function() {
	this.getCanvas().setPosition(0, 0, -1950);
	this._loadResources();

	this._driver = new Driver(this.getCanvas());
	this._driver.addToCanvas();

	this.addEventHandler("arrayDataReceived", this._createArrayDataHandlingFunction());
	this.addEventHandler("experimentEnded", this._createExperimentEndHandlingFunction());

	this._createCSVFiles();
}

GamePlayState.prototype._createExperimentEndHandlingFunction = function() {
	var self = this;
	return function(event) {
		self.removeEventHandler("arrayDataReceived");
		self.removeEventHandler("experimentEnded");

		self._rawDataCSV.export();
		self._laneDeviationCSV.export();
		self._distanceCSV.export();

		self._driver.removeFromCanvas();
		self.getCanvas().setHDRIRoom(null);
		self.getCanvas().setImageCompositionRoom(null);

		self._removeResourcesFromCanvas();

		self.goToNextState();
	}
}

GamePlayState.prototype._loadResources = function() {
	this._resources["leadingCar"] = this._createCar();
	var leadingCar = this._resources["leadingCar"];
	leadingCar.translate(0, 0, 1925);
	var leadingCarAnimation = new Animation(leadingCar, this._createLeadingCarAnimationFunction());
	leadingCar.setAnimation(leadingCarAnimation);
	leadingCar.addToCanvas();
}

GamePlayState.prototype._removeResourcesFromCanvas = function() {
	for(var drawableName in this._resources)
		this._resources[drawableName].removeFromCanvas();
}

GamePlayState.prototype._createLeadingCarAnimationFunction = function() {
	var playState = this;
	var startTime = new Date().getTime();
	return function(leadingCar) {
		var currentTime = new Date().getTime();
		var elapsedTime = (currentTime - startTime)/1000;
		if(elapsedTime > 30 && elapsedTime < 35 ||
				elapsedTime > 60 && elapsedTime < 65 ||
				elapsedTime > 90 && elapsedTime < 95 ||
				elapsedTime > 120 && elapsedTime < 125) {
			// don't move
		}
		else if(playState._driver.getPosition()[2] <= -1900) {
			var animation = new Animation(leadingCar, function() {});
			var event = new Event("experimentEnded", null);
			Global.EventDispatcher.dispatch(event);
		}
		else {
			leadingCar.translate(0, 0, -0.45);
		}
	}
}

GamePlayState.prototype._createCSVFiles = function() {
	this._rawDataCSV = new CSVFile("rawData.csv");
	this._rawDataCSV.setColumnTitles(["brakeForce", "gasPedalPosition", "wheelRotation", "elapsedTime"]);

	this._laneDeviationCSV = new CSVFile("laneDeviation.csv");
	this._laneDeviationCSV.setColumnTitles(["laneDeviation", "elapsedTime"]);

	this._distanceCSV = new CSVFile("distance.csv");
	this._distanceCSV.setColumnTitles(["ditance", "elapsedTime"]);
}

GamePlayState.prototype._createArrayDataHandlingFunction = function() {
	var self = this;
	return function(event) {
		var elapsedTime = self._getElapsedTimeFromStart();
		console.log(array);

		var array = event.getData().slice();
		self._updateDriverSpeed(array);

		self._times.push(elapsedTime);
		self._samples.push(array);

		var brakeForce = array[0];
		var gasPedalPosition = array[1];
		var wheelRotation = array[2];

		var speedIntensity = self._convertToSpeedIntensity(gasPedalPosition);
		var brakeIntensity = self._convertToBrakeIntensity(brakeForce);
		var rotationIntensity = self._convertToRotationIntensity(wheelRotation);

		var scaledValues = [speedIntensity, brakeIntensity, rotationIntensity, elapsedTime];

		self._rawDataCSV.addRow(scaledValues);
	}
}

GamePlayState.prototype._getElapsedTimeFromStart = function() {
	var currentTime = new Date().getTime();
	var elapsedTime = (currentTime - this._startTime)/1000;

	return elapsedTime;
}

GamePlayState.prototype.draw = function() {
	if(this._client.connectionEstablished())
		this._client.send("Get data");
	this._drawScene();
}

GamePlayState.prototype.goToNextState = function() {
	this._context.setState(new GameResultState(this.getClient(), this.getCanvas(), this.getContext()));
}

GamePlayState.prototype._updateDriverSpeed = function(array) {
	var brakeForce = array[0];
	var gasPedalPosition = array[1];
	var wheelRotation = array[2];

	var speedIntensity = this._convertToSpeedIntensity(gasPedalPosition);
	this._driver.changeSpeed(speedIntensity);

	var brakeIntensity = this._convertToBrakeIntensity(brakeForce);
	this._driver.brake(brakeIntensity);

	var rotationIntensity = this._convertToRotationIntensity(wheelRotation);
	this._driver.turn(rotationIntensity);
}

GamePlayState.prototype._convertToSpeedIntensity = function(gasPedalPosition) {
	var intensity = 1 - this._getScaledValue(gasPedalPosition, 3.25, 0.89);
	return intensity;
}

GamePlayState.prototype._convertToBrakeIntensity = function(brakeForce) {
	var intensity = this._getScaledValue(brakeForce, -0.1, -0.3);
	return intensity;
}

GamePlayState.prototype._convertToRotationIntensity = function(wheelRotation) {
	var intensity = this._getScaledValue(wheelRotation, 4.8, 0.1);
	return intensity;
}

// returns a value between 0 and 1
GamePlayState.prototype._getScaledValue = function(oldValue, oldMax, oldMin) {
	var oldRange = oldMax - oldMin;
	var newValue = (oldValue - oldMin)/oldRange;

	if(newValue > 1)
		return 1;
	if(newValue < 0)
		return 0;

	return newValue;
}

GamePlayState.prototype._drawScene = function() {
	this._positions.push(this.getCanvas().getPosition());
	this._rotations.push(this.getCanvas().getRotation());

	this._recordLaneDeviation();
	this._recordDistance();

	this._dispatchDistanceEvents();

	this._driver.driveForward();
}

GamePlayState.prototype._dispatchDistanceEvents = function() {
	var distance = this._getDistanceFromLeadingCar();

	if(distance > 100 || distance < 50) {
		var event = new Event("distanceOutsideBounds", distance);
		Global.EventDispatcher.dispatch(event);
	}
	else {
		var event = new Event("distanceInsideBounds", distance);
		Global.EventDispatcher.dispatch(event);
	}
}

GamePlayState.prototype._recordLaneDeviation = function() {
	var driverPosition = this._driver.getPosition()[0];
	var elapsedTime = this._getElapsedTimeFromStart();
	var array = [driverPosition, elapsedTime];

	this._laneDeviationCSV.addRow(array);
}

GamePlayState.prototype._recordDistance = function() {
	var distance = this._getDistanceFromLeadingCar();
	var elapsedTime = this._getElapsedTimeFromStart();

	this._distanceCSV.addRow([distance, elapsedTime]);
}

GamePlayState.prototype._getDistanceFromLeadingCar = function() {
	var leadingCar = this._resources["leadingCar"];
	var leadingCarPosition = leadingCar.getPosition()[2];
	var driverPosition = this.getCanvas().getCameraPosition()[2];

	var distance = driverPosition - leadingCarPosition;

	return distance;
}
