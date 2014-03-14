(function () {
  var manager;

  // Wait till the browser is ready to render the game (avoids glitches)
  window.requestAnimationFrame(function () {
    if (localStorage.hasOwnProperty("gameState")) {
      manager = GameManager.deserialize(JSON.parse(localStorage.gameState), KeyboardInputManager, HTMLActuator, localScoreManager);
    }
    else {
      manager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
    }
  });

  window.addEventListener("beforeunload", function () {
    localStorage.gameState = JSON.stringify(manager.serialize());
  });
})();
