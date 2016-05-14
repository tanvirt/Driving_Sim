function GameStateContext(client, canvas) {
	this._state = new GameIntroState(client, canvas, this);
}

GameStateContext.prototype.draw = function() {
	if(!this._state.hasStarted())
		this._state.start();
	this._state.draw();
}

GameStateContext.prototype.setState = function(gameState) {
	this._state = gameState;
}
