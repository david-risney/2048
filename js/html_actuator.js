function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.initializeTextForValue();

  this.score = 0;
}

HTMLActuator.prototype.serialize = function () {
  return {
    valueToTextMap: this.valueToTextMap
  };
}

HTMLActuator.deserialize = function (serializedState) {
  var htmlActuator = new HTMLActuator();
  htmlActuator.valueToTextMap = serializedState.valueToTextMap;
  return htmlActuator;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.over) self.message(false); // You lose
    if (metadata.won) self.message(true); // You win!
  });
};

HTMLActuator.prototype.restart = function () {
  this.clearSummary();
  this.initializeTextForValue();
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

};

HTMLActuator.prototype.initializeTextForValue = function () {
    var ranges = [[0x1f680, 0x1f6c5], [0x1f600, 0x1f640], [0x1f645, 0x1f64f], [0x1F330, 0x1F335], [0x1f337, 0x1F37c]],
        valueList = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048],
        textList,
        randomText = function () {
            var maxValue = ranges.reduce(function (sum, range) { return sum + (range[1] - range[0]); }, 0),
                randomValue = Math.floor(Math.random() * maxValue),
                text;

            for (rangeIdx = 0; !text && rangeIdx < ranges.length; ++rangeIdx) {
                var range = ranges[rangeIdx];
                if (range[1] + 1 - range[0] < randomValue) {
                    randomValue -= (range[1] + 1 - range[0]);
                }
                else {
                    text = document.createElement("div");
                    text.innerHTML = "&#" + (range[0] + randomValue) + ";";
                    text = text.innerText;
                }
            }
            return text;
        },
        valueToText = function (value) {
          return {
            value: value,
            text: randomText()
          };
        };

  this.valueToTextMap = valueList.map(valueToText).reduce(function (map, current) {
    map[current.value] = current.text; return map;
  }, {});
}

HTMLActuator.prototype.getTextForValue = function(value) {
  return this.valueToTextMap[value];
}

HTMLActuator.prototype.clearSummary = function() {
  var cells,
    idx;
  cells = document.querySelectorAll("#game-piece-summary .grid-cell-small");
  for (idx = 0; idx < cells.length - 1; ++idx) {
    if (!cells[idx].textContent.trim()) {
      cells[idx].textContent = "";
    }
  }
  delete this.maxSummary;
}

HTMLActuator.prototype.fillSummary = function(value, text) {
  var cells,
    idx;
  if (!this.maxSummary) {
    this.maxSummary = 1; // Start at 1 to skip unused 1 value.
  }
  if (value > this.maxSummary) {
    this.maxSummary = value;
	cells = document.querySelectorAll("#game-piece-summary .grid-cell-small");
	for (idx = 0; idx < cells.length - 1; ++idx) {
      if (!cells[idx].textContent.trim()) {
        cells[idx].textContent = text;
        break;
	  }
	}
  }
}

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var element   = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];
  this.applyClasses(element, classes);

  element.textContent = this.getTextForValue(tile.value);
  this.fillSummary(tile.value, element.textContent);

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(element, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(element, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(element, classes);
  }

  // Put the tile on the board
  this.tileContainer.appendChild(element);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
