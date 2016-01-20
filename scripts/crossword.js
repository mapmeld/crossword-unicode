var grid, ctx;

$(function() {
  var canvas = $("canvas")[0];
  ctx = canvas.getContext('2d');
  ctx.font = '18px sans-serif';

  var downFirst = true;
  clearCanvas(true);

  function clearCanvas(andPuzzle) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 600, 600);

    if (andPuzzle) {
      grid = [];
      for (var x = 0; x < 15; x++) {
        grid.push([]);
        for (var y = 0; y < 15; y++) {
          grid[grid.length-1].push(null);
        }
      }
    }
  }

  $("#add-clue button").click(function() {
    var word = $("#add-clue input").val();
    word = word.split("");
    $("#add-clue input").val("");

    if (word.length > 15) {
      throw 'too long';
    }

    if (downFirst) {
      if (!fitDown(word)) {
        if (!fitAcross(word)) {
          throw 'problem';
        }
      }
    } else {
      if (!fitAcross(word)) {
        if (!fitDown(word)) {
          throw 'problem';
        }
      }
    }
    // fit on puzzle
    downFirst = !downFirst;
  });

  function drawGrid(x, y) {
    var letter = grid[x][y];
    ctx.fillStyle = '#fff';
    ctx.fillRect(x * 40 + 2, y * 40 + 2, 36, 36);
    if (letter.label) {
      ctx.fillStyle = '#000';
      ctx.fillText(myanmarNumbers(letter.label, 'my'), x * 40 + 10, y * 40 + 20);
    }
  }

  function makeClue(clueNum, word) {
    var clue = $("<li>");
    clue.append($("<strong>").text(clueNum));
    clue.append(word);
    return clue;
  }

  function loop(startIn) {
    for (var col = 2; col < 13; col++) {
      for (var row = 2; row < 13; row++) {
        var madeFit = startIn(row, col);
        if (madeFit) {
          return true;
        }
      }
      // still here
      for (var col2 in [0, 1, 13, 14]) {
        var madeFit = startIn(row, col2);
        if (madeFit) {
          return true;
        }
      }
    }

    // still here
    for (var col in [0, 1, 13, 14]) {
      for (var row = 0; row < 15; row++) {
        var madeFit = startIn(row, col);
        if (madeFit) {
          return true;
        }
      }
    }
    return false;
  }

  function fitDown(word) {
    function startIn(row, col) {
      if (row + word.length > 15) {
        // word is too long
        return false;
      }
      if (grid[col][row] && grid[col][row].label) {
        // another starts here
        return false;
      }
      if (row > 0 && grid[col][row - 1]) {
        // letter above beginning
        return false;
      }
      if ((col > 0 && grid[col - 1][row] && grid[col - 1][row].end) || (col < 14 && grid[col + 1][row] && grid[col + 1][row].label)) {
        // letter left or right of beginning, which is start / end
        return false;
      }

      var x = col;
      for (var char = 0; char < word.length; char++) {
        var y = row * 1 + char * 1;
        var letter = word[char];
        if (grid[x][y] && grid[x][y].letter !== letter) {
          return false;
        }
      }

      // confirmed
      var clueNum = myanmarNumbers($("#clues li").length + 1, 'my');
      var clue = makeClue(clueNum, word.join(''));
      $("#down ul").append(clue);

      for (var char = 0; char < word.length; char++) {
        var y = row * 1 + char * 1;
        var letter = word[char];
        if (!grid[x][y]) {
          grid[x][y] = { letter: letter };
          drawGrid(x, y);
        }
      }
      grid[col][row].label = clueNum;
      drawGrid(col, row);
      grid[col][row + word.length - 1].end = true;
      return true;
    }

    return loop(startIn);
  }

  function fitAcross(word) {
    function startIn(row, col) {
      if (col + word.length > 15) {
        // word is too long
        return false;
      }
      if (grid[col][row] && grid[col][row].label) {
        // another starts here
        return false;
      }
      if (col > 0 && grid[col - 1][row]) {
        // letter left of beginning
        return false;
      }
      if ((row > 0 && grid[col][row - 1] && grid[col][row - 1].end) || (row < 14 && grid[col][row + 1] && grid[col][row + 1].label)) {
        // letter above or below beginning, which is start / end
        return false;
      }

      var y = row;
      for (var char = 0; char < word.length; char++) {
        var x = col * 1 + char * 1;
        var letter = word[char];
        if (grid[x][y] && (grid[x][y].letter !== letter)) {
          return false;
        }
      }

      // confirmed
      var clueNum = myanmarNumbers($("#clues li").length + 1, 'my');
      var clue = makeClue(clueNum, word.join(''));
      $("#across ul").append(clue);

      for (var char = 0; char < word.length; char++) {
        var x = col * 1 + char * 1;
        var letter = word[char];
        if (!grid[x][y]) {
          grid[x][y] = { letter: letter };
          drawGrid(x, y);
        }
      }
      grid[col][row].label = clueNum;
      drawGrid(col, row);
      grid[col + word.length - 1][row].end = true;

      return true;
    }

    return loop(startIn);
  }
});
