#! /usr/bin/env node

const fs = require('fs');
const program = require('commander');
const myanmarNumbers = require('myanmar-numbers');

const Canvas = require('canvas');
const Crossword = require('./crossword-common.js');

// get user config
program
  .version('1.0.0')
  .arguments('<wordList> <saveImage>')
  .option('-w --width <number>', 'columns of crossword', /(\d+)/, 20)
  .option('-h --height <number>', 'rows of crossword', /(\d+)/, 15)
  .option('-l --language <code>', 'en,my,ne,ta,ar,ps,dv', /(.*)/, 'en')
  .parse(process.argv);

if (!program.args.length) {
  throw 'Did not specify a word list or output image file';
}

var sourceFile = program.args[0];
var outputImg = program.args[1] || 'crossword.png';

fs.readFile(sourceFile, { encoding: 'utf-8' }, function (err, srcText) {
  var lines = srcText.trim().split(/[\r|\n]+/);
  lines = lines.map(function(line) {
    line = line.trim();
    var answer = line.split(/\s/)[0];
    var clue = line.substring(answer.length).trim();
    if (!clue.length) {
      clue = answer;
    }
    return { clue: clue, answer: answer };
  });
  lines.sort(function(a, b) {
    return b.answer.length - a.answer.length;
  });

  // generate crossword
  var canv = new Canvas(program.width * 40, program.height * 40);
  var game = new Crossword(canv, program.width, program.height);
  game.clearCanvas(true);

  // detect language?
  if (program.language === 'my') {
    game.setNumberTransform(function(n) {
      return myanmarNumbers(n, 'my');
    });
  } else if (program.language === 'ne') {
    game.setNumberTransform(function(txt) {
      txt += '';
      var numbers = {
        '०': 0,
        '१': 1,
        '२': 2,
        '३': 3,
        '४': 4,
        '५': 5,
        '६': 6,
        '७': 7,
        '८': 8,
        '९': 9
      };

      var keys = Object.keys(numbers);
      for (var n = 0; n <= keys.length; n++) {
        var re = new RegExp(numbers[keys[n]] + "", "g");
        txt = txt.replace(re, keys[n]);
      }
      return txt;
    });
  } else if (program.language === 'ta') {
    game.setNumberTransform(function(txt) {
      txt += '';
      txt = txt.replace('100', '௱');
      txt = txt.replace('10', '௰');
      var numbers = {
        '௦': 0,
        '௧': 1,
        '௨': 2,
        '௩': 3,
        '௪': 4,
        '௫': 5,
        '௬': 6,
        '௭': 7,
        '௮': 8,
        '௯': 9
      };

      var keys = Object.keys(numbers);
      for (var n = 0; n <= keys.length; n++) {
        var re = new RegExp(numbers[keys[n]] + "", "g");
        txt = txt.replace(re, keys[n]);
      }
      return txt;
    });
  } else if (program.language === 'ar' || program.language === 'ps') {
    game.setNumberTransform(function(txt) {
      txt += '';
      var numbers = {
        '٠': 0,
        '١': 1,
        '٢': 2,
        '٣': 3,
        '٤': 4,
        '٥': 5,
        '٦': 6,
        '٧': 7,
        '٨': 8,
        '٩': 9
      };

      var keys = Object.keys(numbers);
      for (var n = 0; n <= keys.length; n++) {
        var re = new RegExp(numbers[keys[n]] + "", "g");
        txt = txt.replace(re, keys[n]);
      }
      return txt;
    });
    game.setDirection('rtl');
  } else if (program.language === 'dv') {
    game.setDirection('rtl');
  }

  function addClue(i) {
    if (i >= lines.length) {
      // output png
      var output = fs.createWriteStream(outputImg);
      var stream = canv.pngStream()
        .on('data', function(chunk){
          output.write(chunk);
        })
        .on('end', function(){
          console.log('completed output to ' + outputImg);
        });
      return;
    }
    game.addWord(lines[i].answer, function (err, anchor, direction) {
      if (err) {
        console.log(err);
      } else {
        console.log(anchor + ' ' + direction + ': ' + lines[i].clue);
      }
      addClue(i + 1);
    });
  }
  addClue(0);
});
