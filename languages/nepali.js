
function setLanguage(canvas, game) {
  var ctx = canvas.getContext('2d');
  ctx.font = "18px NotoSansDevanagari";

  /* language-specifc font controls */
  if ($ && window) {
    $("#unicode, #preeti").change(function() {
      if ($("#preeti").prop("checked")) {
        $("input").addClass("preeti")
      } else {
        $("input").removeClass("preeti");
      }
    });

    if (window.location.href.toLowerCase().indexOf("preeti") > -1) {
      $("#preeti").prop("checked", true);
      $("input").addClass("preeti");
    }
  }

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
}

function languageTransform(word) {
  if ($("#preeti").prop("checked")) {
    return preeti(word);
  } else {
    return word;
  }
}
