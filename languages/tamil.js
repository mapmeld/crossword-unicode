
function setLanguage(canvas, game) {
  var ctx = canvas.getContext('2d');
  ctx.font = "18px NotoSansTamil";

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
}
