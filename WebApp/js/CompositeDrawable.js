function CompositeDrawable(canvas) {
	if(arguments < 1) return;
	DrawableObject.call(this, canvas);
	
	this._canvas = canvas;
	this._components = [];
} CompositeDrawable.prototype = new DrawableObject();

CompositeDrawable.prototype.loadOBJMTL = function(directory, mtlFile, objFile, imageFile) {
	var self = this;
	
	THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
	
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setBaseUrl(directory);
	mtlLoader.setPath(directory);
	mtlLoader.load(mtlFile, function(materials) { self._loadMaterials(materials, directory, objFile, imageFile); });
}

CompositeDrawable.prototype.loadStructureSensorZip = function(zipFile) {
	var self = this;
	var structure = new StructureSensorZIP(this._canvas);
	structure.onLoad = function() {
		var drawables = structure.obj;
		console.log(drawables);
		self._addToComponentsList(drawables);
		self.onLoad();
	}
	structure.load(zipFile);
}

CompositeDrawable.prototype.addDrawables = function(drawables) {
	this._addToComponentsList(drawables);
	this.onLoad();
}

CompositeDrawable.prototype.onLoad = function() {
	console.log("Composite drawable loaded");
}

CompositeDrawable.prototype._addToComponentsList = function(drawables) {
    this._components.push.apply(this._components, drawables);
}

CompositeDrawable.prototype._loadMaterials = function(materials, directory, objFile, imageFile) {
	var self = this;
	
	materials.preload();
	
	var objLoader = new THREE.OBJLoader();
	
	objLoader.setMaterials(materials);
	objLoader.setPath(directory);
	objLoader.load(objFile, function(object) { self._loadDrawables(object, directory + imageFile); });
}

CompositeDrawable.prototype._loadDrawables = function(object, imageFile) {
	for(var i = 0; i < object.children.length; i++) {
		var child = object.children[i];
		var geometry = child.geometry;
		var attributes = geometry.attributes;
		
		if(attributes.position.array.length != 0) {
			var drawables = this._createDrawables(geometry, imageFile);
			this._addToComponentsList(drawables);
		}
	}

	this.onLoad();
}

CompositeDrawable.prototype._createDrawables = function(geometry, imageFile) {
	var drawables = [];
	
	var attributes = geometry.attributes;
	var xyzLength = attributes.position.array.length;
	
	var maxArrayLength = 63000;
	for(var i = 0; i < xyzLength; i += maxArrayLength) {
		var startIndex = i;
		var endIndex = xyzLength;
		
		if(xyzLength + 1 > i + maxArrayLength)
			endIndex = i + maxArrayLength;

		var xyz = this._getXYZ(attributes.position, startIndex, endIndex);
		var triangles = this._getTriangles(geometry.index, startIndex, endIndex);
		var normals = this._getNormals(attributes.normal, startIndex, endIndex);
		var uv = this._getUV(attributes.uv, startIndex, endIndex);
		var colors = this._getDefaultColors(endIndex - startIndex);
		
		var drawable = this._createDrawable(xyz, triangles, normals, uv, colors, imageFile);
		drawables.push(drawable);
	}
	
	return drawables;
}

CompositeDrawable.prototype._getTriangles = function(triangles, startIndex, endIndex) {
	if(triangles == null)
		return this._getDefaultTriangles((endIndex - startIndex)/3);
	else
		return triangles.slice(startIndex, endIndex);
}

CompositeDrawable.prototype._getUV = function(uv, startIndex, endIndex) {
	if(uv == null)
		return null;
	else
		return uv.array.slice(startIndex*2/3, endIndex*2/3);
}

CompositeDrawable.prototype._getNormals = function(normals, startIndex, endIndex) {
	if(normals == null)
		return null;
	else
		return normals.array.slice(startIndex, endIndex)
}

CompositeDrawable.prototype._getXYZ = function(xyz, startIndex, endIndex) {
	return xyz.array.slice(startIndex, endIndex);
}

CompositeDrawable.prototype._createDrawable = function(xyz, triangles, normals, uv, colors, imageFile) {
	var drawable = new DrawableObject(this._canvas);
	
	drawable.setXYZ(xyz);
	drawable.setTriangles(triangles);
	drawable.setNormals(normals);
	if(uv != null)
		drawable.setUV(uv);
	drawable.setColors(colors);
	drawable.setTexture(imageFile);
	
	return drawable;
}

CompositeDrawable.prototype._getDefaultTriangles = function(xyzLength) {
	var triangles = [];
	for(var i = 0; i < xyzLength; i++)
		triangles.push(i);
	
	return triangles;
}

CompositeDrawable.prototype._getDefaultColors = function(xyzLength) {
	var colors = [];
	for(var i = 0; i < xyzLength/3; i++) {
		colors.push(1);
		colors.push(1);
		colors.push(1);
	}
	
	return colors;
}

CompositeDrawable.prototype.setColor = function(color) {
	for(var i = 0; i < this._components.length; i++) {
		var component = this._components[i];
		var colors = [];
		for(var j = 0; j < component.buffers["aXYZ"].data/3; i++) {
			colors.push(color[0]);
			colors.push(color[1]);
			colors.push(color[2]);
		}
		component.setColors(colors);
	}
}

CompositeDrawable.prototype.draw = function() {
	for(var i = 0; i < this._components.length; i++) {
		this._components[i].updateShader();
		this._components[i].draw();
	}
}

CompositeDrawable.prototype.readyToDraw = function() {
	return this._components.length != 0;
}
