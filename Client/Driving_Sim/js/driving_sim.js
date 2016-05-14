var my_client = new Client("ws://localhost:9002");
var my_canvas = new Canvas(my_client);

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

document.onkeydown = function(event) {
	my_canvas.handleKeyDown(event);
};

document.onkeyup = function(event) {
	my_canvas.handleKeyUp(event);
};
