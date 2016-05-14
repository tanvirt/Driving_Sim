function CanvasMath() {}

CanvasMath.generateUniqueString = function(length) {
	var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	return Array(length).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
}

CanvasMath.degreesToRadians = function(degrees) {
	return degrees*Math.PI/180;
}

CanvasMath.createVec3 = function(startXYZ, endXYZ) {
	var vector = [
  		endXYZ[0] - startXYZ[0],
  		endXYZ[1] - startXYZ[1],
  		endXYZ[2] - startXYZ[2]
  	];
	
	return vector;
}

CanvasMath.getDirectionVec3 = function(vec, magnitude) {
	if(magnitude == 0)
		return [0, 0, 0];
	
	var direction = [
		vec[0]/magnitude,
		vec[1]/magnitude,
		vec[2]/magnitude
	];
	
	return direction;
}

CanvasMath.getVec3Magnitude = function(vec) {
	return Math.sqrt(
		Math.pow(vec[0], 2) +
		Math.pow(vec[1], 2) +
		Math.pow(vec[2], 2)
	);
}

CanvasMath.distanceFromPointToPoint3D = function(x1, y1, z1, x2, y2, z2) {
	return Math.sqrt( Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2) + Math.pow((z2 - z1), 2) );
}
