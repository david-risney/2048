(function () {
  var manager;

  // Wait till the browser is ready to render the game (avoids glitches)
  window.requestAnimationFrame(function () {
      try { 
          if (localStorage.hasOwnProperty("gameState")) {
              var gameState = JSON.parse(localStorage.gameState);
              manager = GameManager.deserialize(gameState.manager, KeyboardInputManager, HTMLActuator, LocalScoreManager);
          }
      }
      catch (e) {
          console.error("Failed to load gamestate: " + e);
          delete localStorage.gameState;
      }

    if (!manager) {
      manager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
    }
  });

  window.addEventListener("beforeunload", function () {
    localStorage.gameState = JSON.stringify({
      manager: manager.serialize()
    });
  });
})();
