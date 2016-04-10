function CanvasMath() {}

CanvasMath.generateUniqueString = function(length) {
	var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	return Array(length).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
}

CanvasMath.getMidpoint = function(point1, point2) {
	var midpoint = [];
    for(var i = 0; i < 3; i++)
    	midpoint.push((point1[i] + point2[i])/2);
    
    return midpoint;
}

// DEV: this conversion needs to be updated.
CanvasMath.leapPointToGlPoint = function(leapXYZ) {
	var glXYZ = [];
	glXYZ[0] = 0.0 + 0.006*leapXYZ[0];
	glXYZ[1] = -1 + 0.004*leapXYZ[1];
	glXYZ[2] = -3 + 0.007*leapXYZ[2];
	
	return glXYZ;
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

// DEV: the rotated coordinates seem to be closer to the origin than previously
// Angles must be in radians.
CanvasMath.getRotatedXYZ = function(xyz, originXYZ, thetaX, thetaY, thetaZ) {
	var rotatedXYZ = [xyz[0] - originXYZ[0], xyz[1] - originXYZ[1], xyz[2] - originXYZ[2]];
	if(thetaX != 0) {
		rotatedXYZ[1] = Math.cos(thetaX)*rotatedXYZ[1] - Math.sin(thetaX)*rotatedXYZ[2];
		rotatedXYZ[2] = Math.sin(thetaX)*rotatedXYZ[1] + Math.cos(thetaX)*rotatedXYZ[2];
	}
	if(thetaY != 0) {
		rotatedXYZ[0] = Math.cos(thetaY)*rotatedXYZ[0] + Math.sin(thetaY)*rotatedXYZ[2];
		rotatedXYZ[2] = -Math.sin(thetaY)*rotatedXYZ[0] + Math.cos(thetaY)*rotatedXYZ[2];
	}
	if(thetaZ != 0) {
		rotatedXYZ[0] = Math.cos(thetaZ)*rotatedXYZ[0] - Math.sin(thetaZ)*rotatedXYZ[1];
		rotatedXYZ[1] = Math.sin(thetaZ)*rotatedXYZ[0] + Math.cos(thetaZ)*rotatedXYZ[1];
	}
	rotatedXYZ = [rotatedXYZ[0] + originXYZ[0], rotatedXYZ[1] + originXYZ[1], rotatedXYZ[2] + originXYZ[2]];
	return rotatedXYZ;
}

CanvasMath.distanceFromPointToPoint3D = function(x1, y1, z1, x2, y2, z2) {
	return Math.sqrt( Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2) + Math.pow((z2 - z1), 2) );
}

CanvasMath.multiplyMat4Vec4 = function(mat, vec) {
	return [
		mat[0]*vec[0] 	+ mat[4]*vec[1] 	+ mat[8]*vec[2] 	+ mat[12]*vec[3],
		mat[1]*vec[0] 	+ mat[5]*vec[1] 	+ mat[9]*vec[2] 	+ mat[13]*vec[3],
		mat[2]*vec[0] 	+ mat[6]*vec[1] 	+ mat[10]*vec[2] 	+ mat[14]*vec[3],
		mat[3]*vec[0] 	+ mat[7]*vec[1] 	+ mat[11]*vec[2] 	+ mat[15]*vec[3]
	];
}

CanvasMath.getProjectedPixelPoint = function(canvas, xyz) {
	var mvMatrix = canvas.getCamera().mvMatrix;
	var fieldOfView = CanvasMath.degreesToRadians(canvas.getCamera().getFOV());
	var height = canvas.gl.viewportHeight;
	
	var point = [xyz[0], xyz[1], xyz[2], 1];
	var vector = CanvasMath.multiplyMat4Vec4(mvMatrix, point);
	
	var projectedPoint = CanvasMath._projectionFrom3dTo2d(vector, fieldOfView, height);
	var pixelX = (canvas.gl.viewportWidth / 2) + projectedPoint[0];
	var pixelY = (canvas.gl.viewportHeight / 2) + projectedPoint[1];
	
	return [pixelX, pixelY];
}

// Field of view must be in radians.
CanvasMath._projectionFrom3dTo2d = function(xyz, fieldOfView, height) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var f = CanvasMath._focalLength(fieldOfView, height);
	
	var projX = ((-x*f) / z);
	var projY = ((y*f) / z);
	
	return [projX, projY];
}

// Angle must be in radians.
CanvasMath._focalLength = function(angle, height) {
	return (height / 2)*( 1 / (Math.tan(angle / 2)) );
}
