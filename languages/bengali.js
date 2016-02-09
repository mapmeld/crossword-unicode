
function setLanguage(canvas, game) {
  var ctx = canvas.getContext('2d');
  ctx.font = "18px NotoSansBengali";

  game.setNumberTransform(function(txt) {
    txt += '';
    var numbers = {
      '০': 0,
      '১': 1,
      '২': 2,
      '৩': 3,
      '৪': 4,
      '৫': 5,
      '৬': 6,
      '৭': 7,
      '৮': 8,
      '৯': 9
    };

    var keys = Object.keys(numbers);
    for (var n = 0; n <= keys.length; n++) {
      var re = new RegExp(numbers[keys[n]] + "", "g");
      txt = txt.replace(re, keys[n]);
    }
    return txt;
  });
}

function languageTransform(word) {
  return word;
}
