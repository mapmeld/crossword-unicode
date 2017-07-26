

/* crossword-common.js */

// magic RegEx to split strings into letters
var accents_and_vowels = "[:\u0300-\u036F" + // Combining Diacritical Marks
"\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7" + // Hebrew
"\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED" + // Arabic
"\u07A6-\u07B0" + // Thaana
"\u0900-\u0903\u093A-\u094C\u094E\u094F\u0951-\u0957\u0962\u0963" + // Devanagari
"\u0981-\u0983\u09BC\u09BE-\u09CC\u09D7\u09E2\u09E3" + // Bengali
"\u0A01-\u0A03\u0A3C-\u0A4C\u0A51" + // Gurmukhi
"\u0A81-\u0A83\u0ABC\u0ABE-\u0ACC\u0AE2\u0AE3" + // Gujarati
"\u0B01-\u0B03\u0B3C\u0B3E-\u0B4C\u0B56\u0B57\u0B62\u0B63" + // Oriya
"\u0B82\u0BBE-\u0BCD\u0BD7" + // Tamil
"\u0C00-\u0C03\u0C3E-\u0C4C\u0C55\u0C56\u0C62\u0C63" + // Telugu
"\u0D82\u0D83\u0DCA-\u0DDF\u0DF2\u0DF3" + // Sinhala
"\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F83\u0F86\u0F87\u0F8D-\u0FBC\u0FC6" + // Tibetan
"\u102B-\u1038\u103A-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D" + // Burmese
"\u1A55-\u1A5E\u1A61-\u1A7C" + // Tai Tham
"\u1DC0-\u1DFF" + // Combining Diacritical Marks Supplement
"\u20D0-\u20FF" + // Combining Diacritical Marks for Symbols
"\u17B4-\u17D1\u17D3" + // Khmer
"\u0C80-\u0C83\u0CBC\u0CBE-\u0CCC\u0CD5\u0CD6\u0CE2\u0CE3" + // Kannada
"\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD" + // Lao
"]";
var combo_characters = "[\u094D\u09CD\u0A4D\u0ACD\u0B4D\u0C4D\u0CCD\u0F84\u1039\u17D2\u1A60\u1A7F]";
var blockFinder = new RegExp("^.(?:" + accents_and_vowels + "+)?" + "(" + combo_characters + "\\W(?:" + accents_and_vowels + "+)?)?");

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

  this.previousWords.push([col, row, 'down', word]);
  return { direction: 'down', anchor: this.numberTransform(clueNum) };
};

Crossword.prototype.startAcrossIn = function(originWord, row, col) {
  var forceLabel = null;
  var word = (this.direction === 'rtl' ? originWord.concat([]).reverse() : originWord);
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

  // reuse label of previous word?
  if (this.direction === 'rtl') {
    if (this.grid[col * 1 + word.length - 1][row] && this.grid[col * 1 + word.length - 1][row].label) {
      forceLabel = this.grid[col * 1 + word.length - 1][row].label;
    }
  } else if (this.grid[col][row] && this.grid[col][row].label) {
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
  if (this.direction === 'rtl') {
    this.grid[col * 1 + word.length - 1][row].label = clueNum;
    this.drawGrid(col * 1 + word.length - 1, row);
  } else {
    this.grid[col][row].label = clueNum;
    this.drawGrid(col, row);
  }

  this.previousWords.push([col, row, 'across', word]);
  return { direction: 'across', anchor: this.numberTransform(clueNum) };
};

Crossword.prototype.setDirection = function(direction) {
  if (direction === 'ltr' || direction === 'rtl') {
    this.direction = direction;
  } else {
    throw 'did not understand direction - use ltr or rtl';
  }
};

Crossword.prototype.addWord = function(answer, callback) {
  var word = [];

  // common ligature in Arabic script
  answer = answer.replace(/لا/g, 'ﻻ');

  while (answer.length) {
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
