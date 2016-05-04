function LinePlot(containerId) {
	this._containerId = containerId;
	if(this._containerId == undefined)
        this._containerId = this._createContainer().id;
    
	this._numDataSeries = 0;
	
	this._plot = null;
	this._dataPoints = [];
	
	this._title = null;
	this._xAxisTitle = null;
	this._yAxisTitle = null;
	this._legendNames = [];
	
	this._initialize();
}

LinePlot.prototype.getDataPoints = function() {
	return this._dataPoints;
}

LinePlot.prototype.getDivContainer = function() {
	return document.getElementById(this._containerId);
}

LinePlot.prototype.removeFromDOM = function() {
	var container = this.getDivContainer();
	while(container.hasChildNodes()) {
	    container.removeChild(container.lastChild);
	}
	container.parentElement.removeChild(container);
}

LinePlot.prototype.hideVisibility = function() {
	var container = this.getDivContainer();
	container.style.display = "none";
}

LinePlot.prototype.getImageURL = function() {
	var canvas = document.getElementById(this._containerId).children[0].children[0];
	return canvas.toDataURL();
}

LinePlot.prototype.getNumDataSeries = function() { return this._numDataSeries; }

LinePlot.prototype.setNumDataSeries = function(numDataSeries) { 
	this._numDataSeries = numDataSeries; 
	this._initialize();
}

LinePlot.prototype.setTitle = function(title) { 
	this._title = title;
	this._initialize(); 
}

LinePlot.prototype.setXAxisTitle = function(title) { 
	this._xAxisTitle = title;
	this._initialize(); 
}

LinePlot.prototype.setYAxisTitle = function(title) { 
	this._yAxisTitle = title;
	this._initialize(); 
}

LinePlot.prototype.setLegendNames = function(legendNames) { 
	this._legendNames = legendNames;
	this._initialize();
}

LinePlot.prototype.reset = function() {
	this._plot = null;
	this._dataPoints = [];
}

// draws the plot
LinePlot.prototype.draw = function() {
	this._plot.render();
}

// (sampleX, sampleY) is the value being plotted; index is the number of the data series that the sample is associated with
LinePlot.prototype.addSample = function(sampleX, sampleY, index) {
	this._dataPoints[index].push({
		x: sampleX,
		y: sampleY
	});
}

LinePlot.prototype.addSamples = function(sampleXArray, sampleYArray, index) {
	for(var i = 0; i < sampleXArray.length; i++) {
		var sampleX = sampleXArray[i];
		var sampleY = sampleYArray[i];
		this._dataPoints[index].push({
			x: sampleX,
			y: sampleY
		});
	}
}

LinePlot.prototype.resize = function() {
	var container = document.getElementById(this._containerId);

	var realToCSSPixels = window.devicePixelRatio || 1;
	
	// lookup the size the browser is displaying the canvas in CSS pixels
	// and compute a size needed to make our drawing buffer match it in
	// device pixels.
	var displayWidth = Math.floor(container.clientWidth  * realToCSSPixels);
	var displayHeight = Math.floor(container.clientHeight * realToCSSPixels);
	
	// check if the container is not the same size.
	if(container.width != displayWidth || container.height != displayHeight) {
		// make the container the same size
		container.width  = displayWidth;
		container.height = displayHeight;
		
		this._initialize(); // since the size of the container has changed, re-initialize the plot
	}
}

LinePlot.prototype._initialize = function() {
	this.reset();

	var dataSeries = [];
	this._plot = this._createPlot(dataSeries);
	this._createDataSeries(dataSeries);

	this.draw();
}

LinePlot.prototype._createDataSeries = function(dataSeries) {
	for(var i = 0; i < this._numDataSeries; i++) {
		this._dataPoints.push([]);
		dataSeries.push({
			type: "line",
			name: this._getLegendName(i),
			showInLegend: this._legendNames.length != 0,
			legendText: this._getLegendName(i),
			markerType: "none",
			dataPoints: this._dataPoints[i]
		});
	}
}

LinePlot.prototype._createPlot = function(dataSeries) {
	return new CanvasJS.Chart(this._containerId, {
		toolTip: { enabled: false },
		data: dataSeries,
		title: { text: this._title },
		axisX: { title: this._xAxisTitle },
		axisY: { title: this._yAxisTitle },
		legend: {
			horizontalAlign: "center", // "center", "left", "right"
        	verticalAlign: "top" // "center", top", "bottom"
   		}
	});
}

LinePlot.prototype._getLegendName = function(index) {
	if(this._legendNames.length != 0)
		return this._legendNames[index];
	else
		return null;
}

LinePlot.prototype._createContainer = function() {
	var container = document.createElement("DIV");
    
    container.id = "line_plot_container";
    container.style.position = "absolute";
    container.style.width = "100%";
    container.style.top = "0px";
    container.style.bottom = "0px";
    container.style.right = "0px";
    
    document.body.appendChild(container);
    
    return container;
}
