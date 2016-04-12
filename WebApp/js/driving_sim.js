var getCgiText = function() {
	return "texture road1 Road1.bmp\n" +
		"texture road2 Road2.bmp\n" +
		"texture road3 Road3.bmp\n" +
		"texture road4 Road4.bmp\n" +
		"texture road5 Road5.bmp\n" +
		"texture grass grass2.jpg\n" +
		"clearcolor 0 0 0\n" +
		"enable textures\n" +
		"color 1 1 1\n" +
		"pushMatrix\n" +
		"translate 0 -1 0\n" +
		"	pushMatrix\n" +
		"		translate 0 -1.501 -50\n" +
		"		rotate -90 1 0 0\n" +
		"		bindtexture grass\n" +
		"		rectangle 400 400 50 100\n" +
		"	popMatrix\n" +
		"	pushMatrix\n" +
		"		translate -8 -1.5 -50\n" +
		"		rotate -90 1 0 0\n" +
		"		bindtexture road5\n" +
		"		rectangle 8 400 1 25\n" +
		"	popMatrix\n" +
		"	pushMatrix\n" +
		"		translate 0 -1.5 -50\n" +
		"		rotate -90 1 0 0\n" +
		"		bindtexture road4\n" +
		"		rectangle 8 400 1 25\n" +
		"	popMatrix\n" +
		"popMatrix\n" +
		"disable textures\n";
}

var my_client = new Client("ws://localhost:9002");
var my_canvas = new Canvas(my_client);

var composition = new GLImageComposition(my_canvas);
composition.filename = "http://localhost/webapps/Driving_Sim/track2";
composition.instructions = new Array();
composition.textures = new Array();

var cgiText = getCgiText();
composition.handleLoadedFile(cgiText);

my_canvas.setRoom(composition);

var game = new Game(my_client, my_canvas);

my_canvas.onDrag = function(event) {
	my_canvas.getCamera().oneFingerRotate(event);
}

document.body.onkeypress = function(event) {
	if(event.keyCode === 49)
		my_canvas.useRegularProjector();
	else if(event.keyCode === 50)
		my_canvas.useRedCyanProjector();
	else if(event.keyCode === 51)
		my_canvas.useOculusProjector();
	else if(event.keyCode === 52)
		my_canvas.useSideBySideProjector();
}

/*
document.onkeydown = function(event) {
	my_canvas.handleKeyDown(event);
};

document.onkeyup = function(event) {
	my_canvas.handleKeyUp(event);
};
*/
