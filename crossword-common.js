

/* crossword-common.js */

var Crossword = function(canvas, width, height) {
  this.grid = [];
  this.ctx = canvas.getContext('2d');
  this.anchor = 1;
  this.previousWords = [];
  this.downFirst = (Math.random() > 0.5);
  this.width = width;
  this.height = height;
  this.numberTransform = function(n) {
    return n;
  };
  return this;
};

Crossword.prototype.clearCanvas = function(resetPuzzle) {
  this.ctx.fillStyle = '#000';
  this.ctx.fillRect(0, 0, 40 * this.width, 40 * this.height);

  if (resetPuzzle) {
    this.grid = [];
    for (var x = 0; x < this.width; x++) {
      this.grid.push([]);
      for (var y = 0; y < this.height; y++) {
        this.grid[this.grid.length-1].push(null);
      }
    }
  }
};

Crossword.prototype.setNumberTransform = function(transform) {
  this.numberTransform = transform;
};

Crossword.prototype.drawGrid = function(x, y) {
  var letter = this.grid[x][y];
  this.ctx.fillStyle = '#fff';
  this.ctx.fillRect(x * 40 + 2, y * 40 + 2, 36, 36);
  if (letter.label) {
    this.ctx.fillStyle = '#000';
    this.ctx.fillText(this.numberTransform(letter.label), x * 40 + 10, y * 40 + 20);
  }
};

Crossword.prototype.loop = function(word, repFunction) {
  var endcols = [this.width - 3, this.width - 2, this.width - 1];
  for (var col = 3; col < this.width - 3; col++) {
    for (var row = 3; row < this.height - 3; row++) {
      var madeFit = repFunction(word, row, col);
      if (madeFit) {
        return madeFit;
      }
    }
    // still here
    for (var col2 in [0, 1, 2].concat(endcols)) {
      var madeFit = repFunction(word, row, col2);
      if (madeFit) {
        return madeFit;
      }
    }
  }

  // still here
  for (var col in [0, 1, 2].concat(endcols)) {
    for (var row = 0; row < this.height; row++) {
      var madeFit = repFunction(word, row, col);
      if (madeFit) {
        return madeFit;
      }
    }
  }
  return false;
};

Crossword.prototype.startDownIn = function(word, row, col) {
  var forceLabel = null;
  if (row * 1 + word.length > this.height) {
    // word is too long
    return false;
  }
  if (row > 0 && this.grid[col][row - 1]) {
    // letter above beginning
    return false;
  }
  if (row * 1 + word.length < this.width && this.grid[col][row * 1 + word.length]) {
    // letter after end
    return false;
  }
  if (this.grid[col][row] && this.grid[col][row].label) {
    // another starts here - that's OK but we reuse the label
    forceLabel = this.grid[col][row].label;
  }

  // go the right number of squares, checking that the word fits
  var x = col;
  for (var char = 0; char < word.length; char++) {
    var y = row * 1 + char * 1;
    var letter = word[char];
    if (this.grid[x][y] && this.grid[x][y].letter !== letter) {
      return false;
    }
    if (!this.grid[x][y] && ((x > 0 && this.grid[x - 1][y]) || (x < this.width - 1 && this.grid[x * 1 + 1][y]))) {
      // setting a new letter... is a letter left or right of box, which is start / end
      return false;
    }
  }

  // confirmed
  // draw squares
  for (var char = 0; char < word.length; char++) {
    var y = row * 1 + char * 1;
    var letter = word[char];
    if (!this.grid[x][y]) {
      this.grid[x][y] = { letter: letter };
      this.drawGrid(x, y);
    }
  }

  // draw first square with number
  var clueNum = forceLabel || (this.anchor++);
  this.grid[col][row].label = clueNum;
  this.drawGrid(col, row);

  // add an 'end' mark so no one puts a square underneath it
  this.grid[col][row * 1 + word.length - 1].end = true;

  this.previousWords.push([col, row, 'down', word]);
  return { direction: 'down', anchor: this.numberTransform(clueNum) };
};

Crossword.prototype.startAcrossIn = function(word, row, col) {
  var forceLabel = null;
  if (col * 1 + word.length > this.width) {
    // word is too long
    return false;
  }
  if (col > 0 && this.grid[col - 1][row]) {
    // letter left of beginning
    return false;
  }
  if (col * 1 + word.length < this.width && this.grid[col * 1 + word.length][row]) {
    // letter right of ends
    return false;
  }
  if (this.grid[col][row] && this.grid[col][row].label) {
    // another starts here - that's OK but we reuse the label
    forceLabel = this.grid[col][row].label;
  }

  var y = row;
  for (var char = 0; char < word.length; char++) {
    var x = col * 1 + char * 1;
    var letter = word[char];
    if (this.grid[x][y] && (this.grid[x][y].letter !== letter)) {
      return false;
    }
    if (!this.grid[x][y] && ((y > 0 && this.grid[x][y - 1]) || (y < this.height - 1 && this.grid[x][y * 1 + 1]))) {
      // setting a new letter... check for letter above or below beginning, which is start / end
      return false;
    }
  }

  // confirmed
  for (var char = 0; char < word.length; char++) {
    var x = col * 1 + char * 1;
    var letter = word[char];
    if (!this.grid[x][y]) {
      this.grid[x][y] = { letter: letter };
      this.drawGrid(x, y);
    }
  }

  // first square gets a number
  var clueNum = forceLabel || (this.anchor++);
  this.grid[col][row].label = clueNum;
  this.drawGrid(col, row);

  // add an 'end' mark so no one puts a square right of it
  this.grid[col * 1 + word.length - 1][row].end = true;

  this.previousWords.push([col, row, 'across', word]);
  return { direction: 'across', anchor: this.numberTransform(clueNum) };
};

Crossword.prototype.addWord = function(answer, callback) {
  // magic RegEx to split strings into letters
  var accents_and_vowels = "[:\u0300-\u036F\u0902\u093E-\u0944\u0947\u0948\u094B\u094C\u0962\u0963\u0981\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB\u09CC\u09D7\u09E2\u09E3\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u102B-\u1032\u1036-\u1038\u103A-\u103E\u1056-\u1059\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]";
  var combo_characters = "[\u094D\u09CD\u1039]";

  var word = [];
  while (answer.length) {
    var startChar = answer[0];
    var blockFinder = startChar + "(?:" + accents_and_vowels + "+)?" + "(" + combo_characters + "\\W(" + accents_and_vowels + ")?)?";
    var block = (new RegExp(blockFinder)).exec(answer)[0];
    word.push(block);
    answer = answer.substring(block.length);
  }

  // word must be longer than one block
  if (word.length <= 1) {
    if (callback && (typeof callback === 'function')) {
      return callback('word is too short');
    } else {
      throw 'word is too short';
    }
  }

  // number of letters should be shorter than width or height
  if (word.length > Math.max(this.width, this.height)) {
    if (callback && (typeof callback === 'function')) {
      return callback('word is too long');
    } else {
      throw 'word is too long';
    }
  }

  if (this.previousWords.length) {
    // some words already exist
    // try to fit words together so it doesn't look dumb

    // random sort
    this.previousWords.sort(function() { return Math.random() - 0.5; });

    for (var w = 0; w < this.previousWords.length; w++) {
      // attempt to connect tail of the word
      for (var l = word.length - 1; l >= 0; l--) {
        if (this.previousWords[w][3].indexOf(word[l]) > -1) {
          // maybe a connection?
          var x = this.previousWords[w][0] * 1;
          var y = this.previousWords[w][1] * 1;
          var madeFit;
          if (this.previousWords[w][2] === 'across') {
            // previous word was across, so I should try to go down through it
            x += 1 * this.previousWords[w][3].indexOf(word[l]);
            y -= l;
            if (y > 0) {
              madeFit = this.startDownIn(word, y, x);
            }
          } else {
            // previous word as down, so I should try to go across through it
            x -= l;
            y += 1 * this.previousWords[w][3].indexOf(word[l]);
            if (x > 0) {
              madeFit = this.startAcrossIn(word, y, x);
            }
          }
          if (madeFit) {
            return callback(null, madeFit.anchor, madeFit.direction);
          }
        }
      }
    }
  }

  function noFit() {
    if (callback && (typeof callback === 'function')) {
      return callback('couldn\'t fit word');
    } else {
      throw 'couldn\'t fit word';
    }
  }

  this.downFirst = !this.downFirst;
  if (!this.downFirst) {
    var madeFit = this.loop(word, this.startDownIn.bind(this));
    if (madeFit) {
      return callback(null, madeFit.anchor, madeFit.direction);
    } else {
      madeFit = this.loop(word, this.startAcrossIn.bind(this));
      if (madeFit) {
        return callback(null, madeFit.anchor, madeFit.direction);
      } else {
        noFit();
      }
    }
  } else {
    var madeFit = this.loop(word, this.startAcrossIn.bind(this));
    if (madeFit) {
      return callback(null, madeFit.anchor, madeFit.direction);
    } else {
      madeFit = this.loop(word, this.startDownIn.bind(this));
      if (madeFit) {
        return callback(null, madeFit.anchor, madeFit.direction);
      } else {
        noFit();
      }
    }
  }
};

if (typeof module === 'object') {
  module.exports = Crossword;
}
