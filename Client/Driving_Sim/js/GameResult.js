function GameResult(game) {
	this._canvas = game.getCanvas();

	this._samples = game.getSamples();
	this._times = game.getTimes();

	this._positions = game.getPositions();
	this._rotations = game.getRotations();

	this._car = this._createCar();
	this._plot = null;

	this._currentStateStartTime = new Date().getTime();
	this._state = GameResultState.CONSTRUCTED;
}

GameResult.prototype.draw = function() {
	if(this._state == GameResultState.CONSTRUCTED)
		this._startReplay();
	if(this._state == GameResultState.REPLAY)
		this._drawReplay();
	else if(this._state == GameResultState.LINE_PLOT)
		this._drawLinePlot();
}

GameResult.prototype._startReplay = function() {
	this._currentStateStartTime = new Date().getTime();
	this._state = GameResultState.REPLAY;
	this._zoomOut();
}

GameResult.prototype._startLinePlot = function() {
	this._currentStateStartTime = new Date().getTime();
	this._state = GameResultState.LINE_PLOT;
}

GameResult.prototype._endResults = function() {
	this._currentStateStartTime = new Date().getTime();
	this._state = GameResultState.FINISHED;
}

GameResult.prototype._drawReplay = function() {
	var keyFrameDuration = 20;

	var currentTime = new Date().getTime();
	var elapsedTime = currentTime - this._currentStateStartTime;
	var keyFrame = Math.floor(elapsedTime/keyFrameDuration);
	var delta = (elapsedTime/keyFrameDuration) - keyFrame;

	if(keyFrame >= this._positions.length - 1) {
		keyFrame = this._positions.length - 2;
		delta = 1;
	}

	if(keyFrame == this._positions.length - 2)
		this._startLinePlot();

	this._drawPath(keyFrame, delta);
}

GameResult.prototype._drawPath = function(keyFrame, delta) {
	var currentPosition = this._positions[keyFrame];
	var nextPosition = this._positions[keyFrame + 1];

	var xPos = currentPosition[0]*(1 - delta) +
			nextPosition[0]*delta;

	var zPos = currentPosition[2]*(1 - delta) +
			nextPosition[2]*delta;

	var currentRotation = this._rotations[keyFrame];
	var nextRotation = this._rotations[keyFrame + 1];

	var yRot = currentRotation[1]*(1 - delta) +
			nextRotation[1]*delta;

	this._car.setPosition([-xPos, -2.8, -zPos]);
	this._car.setRotation([0, -yRot, 0]);

	this._canvas.setPosition(xPos, -200, zPos);
}

GameResult.prototype._drawLinePlot = function() {
	var linePlot = this._createLinePlot();

	this._fillLinePlot(linePlot);
	linePlot.draw();
	this._addLinePlotToCanvas(linePlot);
	linePlot.removeFromDOM();

	this._endResults();
}

GameResult.prototype._fillLinePlot = function(linePlot) {
	for(var i = 0; i < linePlot.getNumDataSeries(); i++) {
		for(var j = 0; j < this._samples.length; j++) {
			var time = this._times[j];
			var sample = this._samples[j][i];
			linePlot.addSample(time, sample, i);
		}
	}
}

GameResult.prototype._addLinePlotToCanvas = function(linePlot) {
	console.log(linePlot.getDataPoints());
	
	exportToCsv("exportToCsv.csv", [[1, 2, 3], [4, 5, 6]]);

	var linePlotImage = linePlot.getImageURL();

	this._createAndDownloadPDF(linePlotImage, "download.pdf");

	var plot = this._createRectangle(1.25, 1, linePlotImage);

	var rotation = this._canvas.getRotation();
	var position = this._canvas.getPosition();

	plot.rotate(-rotation[0], -rotation[1], -rotation[2]);
	plot.translate(-position[0], -position[1], -position[2]);
	this._canvas.translate(0, -1.5, 0);

	this._plot = plot;

	plot.addToCanvas();
}

function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

GameResult.prototype._createAndDownloadPDF = function(image, fileName) {
	var pdf = new jsPDF();
    pdf.addImage(image, 'JPEG', 0, 0);
    pdf.save(fileName);
}

GameResult.prototype._zoomOut = function() {
	this._canvas.setRotation(degToRad(90), 0, 0);
	this._canvas.setPosition(0, -200, 0);
	this._car.addToCanvas();
}

GameResult.prototype._createLinePlot = function() {
	var linePlot = new LinePlot();
	linePlot.hideVisibility();

	linePlot.setNumDataSeries(3);
	linePlot.setTitle("Recorded Data");
	linePlot.setLegendNames(["Brake Force", "Gas Position", "Gas Force"]);
	linePlot.setXAxisTitle("Time Passed (in seconds)");
	linePlot.setYAxisTitle("Voltage");

	return linePlot;
}

GameResult.prototype._createRectangle = function(width, height, image) {
	var halfWidth = width/2;
	var halfHeight = height/2;

	var xyz = [
		-halfWidth, halfHeight, 0,
   		halfWidth, halfHeight, 0,
   		-halfWidth, -halfHeight, 0,
   		halfWidth, -halfHeight, 0
   	];

   	var triangles = [0,2,1,	1,2,3];
   	var uv = [0,1, 1,1, 0,0, 1,0];

	var square = new DrawableObject(this._canvas);
	square.setXYZ(xyz);
	square.setTriangles(triangles);
	square.setUV(uv);
	square.setTexture(image);

	return square;
}

GameResult.prototype._createCar = function() {
	var car = new CompositeDrawable(this._canvas);
	car.loadOBJMTL('obj/Model_Car_2/', 'Model.mtl', 'Model.obj', 'Model.png');
	car.translate(0, -2.8, 0);

	return car;
}
