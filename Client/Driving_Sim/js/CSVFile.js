function CSVFile(filename) {
	this._filename = filename;
    this._columnTitles = [];
	this._rows = [];
}

CSVFile.prototype.setColumnTitles = function(titles) {
    this._columnTitles = titles;
}

CSVFile.prototype.addRow = function(row) {
	this._rows.push(row);
}

CSVFile.prototype.export = function() {
	this._exportToCsv(this._filename, this._rows);
}

// example: exportToCsv("exportToCsv.csv", [[1, 2, 3], [4, 5, 6]]);
CSVFile.prototype._exportToCsv = function(filename, rows) {
    var csvFile = this._createCSVString(rows);
    this._createAndSaveFile(filename, csvFile);
}

CSVFile.prototype._createCSVString = function(rows) {
	var csvFile = this._processTitles(this._columnTitles);
    for(var i = 0; i < rows.length; i++)
        csvFile += this._processRow(rows[i]);
    return csvFile;
}

CSVFile.prototype._processTitles = function(titles) {
    var finalTitles = '';
    for(var i = 0; i < titles.length; i++) {
        finalTitles += titles[i] + ",";
    }
    return finalTitles + '\n';
}

CSVFile.prototype._processRow = function(row) {
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
}

CSVFile.prototype._createAndSaveFile = function(filename, csvFile) {
	var blob = new Blob(
		[csvFile], 
		{ type: 'text/csv;charset=utf-8;' }
	);

    if(navigator.msSaveBlob) // IE 10+
        navigator.msSaveBlob(blob, filename);
    else {
        var link = document.createElement("a");
        if(link.download !== undefined) { // feature detection
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
