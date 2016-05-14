function GameResultState(client, canvas, gameStateContext) {
	if(arguments.length < 3) return;
	GameState.call(this, client, canvas, gameStateContext);
} GameResultState.prototype = new GameState();

GameResultState.prototype.draw = function() {
	console.log('hit');

	
	// first, draw result screen
	// second, draw replay
	// third, create csv file
}
