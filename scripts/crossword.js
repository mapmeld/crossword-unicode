var grid;

var width = 20;
var height = 15;
$("canvas").attr("width", 40 * width).attr("height", 40 * height);

$(function() {
  var canvas = $("canvas")[0];
  var ctx = canvas.getContext('2d');
  ctx.font = '18px Noto Sans Myanmar';

  var previousWords = [];

  var downFirst = true;
  if (Math.random() > 0.5) {
    downFirst = false;
  }
  clearCanvas(true);

  function clearCanvas(andPuzzle) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 40 * width, 40 * height);

    if (andPuzzle) {
      grid = [];
      for (var x = 0; x < width; x++) {
        grid.push([]);
        for (var y = 0; y < height; y++) {
          grid[grid.length-1].push(null);
        }
      }
    }
  }

  var accents_and_vowels = "[:\u0300-\u036F\u0902\u093E-\u0944\u0947\u0948\u094B\u094C\u0962\u0963\u0981\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB\u09CC\u09D7\u09E2\u09E3\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u102B-\u1032\u1036-\u1038\u103A-\u103E\u1056-\u1059\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]";
  var combo_characters = "[\u094D\u09CD\u1039]";

  $("#unicode, #zawgyi").change(function() {
    if ($("#zawgyi").prop("checked")) {
      $("input").css({
        'font-family': "'Zawgyi One', sans-serif"
      });
    } else {
      $("input").css({
        'font-family': "'Noto Sans Myanmar', sans-serif"
      });
    }
  });

  $("#add-clue button").click(function() {
    var inp = $("#word").val().split(/\s/)[0];
    if (!inp.length) {
      return;
    }

    word = [];
    while (inp.length) {
      var startChar = inp[0];
      var fullLetter = startChar + "(?:" + accents_and_vowels + "+)?" + "(" + combo_characters + "\\W(" + accents_and_vowels + ")?)?";
      var nextSquare = (new RegExp(fullLetter)).exec(inp).join('');
      word.push(nextSquare);
      inp = inp.substring(nextSquare.length);
    }

    $("#add-clue input").val("");

    if (word.length > Math.max(width, height)) {
      throw 'too long';
    }

    if (previousWords.length) {
      // some words already exist
      // try to fit words together so it doesn't look dumb
      for (var w = 0; w < previousWords.length; w++) {
        for (var l = word.length - 1; l >= 0; l--) {
          if (previousWords[w][3].indexOf(word[l]) > -1) {
            // maybe a connection?
            var x = previousWords[w][0] * 1;
            var y = previousWords[w][1] * 1;
            var madeFit;
            if (previousWords[w][2] === 'across') {
              // then I should try to go down through it
              x += 1 * previousWords[w][3].indexOf(word[l]);
              y -= l;
              if (y > 0) {
                madeFit = startDownIn(y, x);
              }
            } else {
              // then I should try to go across through it
              x -= l;
              y += 1 * previousWords[w][3].indexOf(word[l]);
              if (x > 0) {
                madeFit = startAcrossIn(y, x);
              }
            }
            if (madeFit) {
              return;
            }
          }
        }
      }
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
    var endcols = [width - 3, width - 2, width - 1];
    for (var col = 3; col < width - 3; col++) {
      for (var row = 3; row < height - 3; row++) {
        var madeFit = startIn(row, col);
        if (madeFit) {
          return true;
        }
      }
      // still here
      for (var col2 in [0, 1, 2].concat(endcols)) {
        var madeFit = startIn(row, col2);
        if (madeFit) {
          return true;
        }
      }
    }

    // still here
    for (var col in [0, 1, 2].concat(endcols)) {
      for (var row = 0; row < height; row++) {
        var madeFit = startIn(row, col);
        if (madeFit) {
          return true;
        }
      }
    }
    return false;
  }

  function startDownIn(row, col) {
    if (row * 1 + word.length > height) {
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
    if (row * 1 + word.length < width && grid[col][row * 1 + word.length]) {
      // letter after end
      return false;
    }

    var x = col;
    for (var char = 0; char < word.length; char++) {
      var y = row * 1 + char * 1;
      var letter = word[char];
      if (grid[x][y] && grid[x][y].letter !== letter) {
        return false;
      }
      if ((x > 0 && grid[x - 1][y] && grid[x - 1][y].end) || (x < (width - 1) && grid[x * 1 + 1][y] && grid[x * 1 + 1][y].label)) {
        // letter left or right of box, which is start / end
        return false;
      }
    }

    // confirmed
    var clueNum = myanmarNumbers($("#clues li").length + 1, 'my');
    var clue = makeClue(clueNum, word.join(''));
    $("#down .list").append(clue);

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
    grid[col][row * 1 + word.length - 1].end = true;
    previousWords.push([col, row, 'down', word]);
    return true;
  }

  function startAcrossIn(row, col) {
    if (col * 1 + word.length > width) {
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
    if (col * 1 + word.length < width && grid[col * 1 + word.length][row]) {
      // letter right of ends
      return false;
    }

    var y = row;
    for (var char = 0; char < word.length; char++) {
      var x = col * 1 + char * 1;
      var letter = word[char];
      if (grid[x][y] && (grid[x][y].letter !== letter)) {
        return false;
      }
      if ((y > 0 && grid[x][y - 1] && grid[x][y - 1].end) || (y < (height - 1) && grid[x][y * 1 + 1] && grid[x][y * 1 + 1].label)) {
        // letter above or below beginning, which is start / end
        return false;
      }
    }

    // confirmed
    var clueNum = myanmarNumbers($("#clues li").length + 1, 'my');
    var clue = makeClue(clueNum, word.join(''));
    $("#across .list").append(clue);

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
    grid[col * 1 + word.length - 1][row].end = true;
    previousWords.push([col, row, 'across', word]);
    return true;
  }

  function fitDown(word) {
    return loop(startDownIn);
  }

  function fitAcross(word) {
    return loop(startAcrossIn);
  }
});
