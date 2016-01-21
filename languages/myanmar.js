
function setLanguage(canvas, game) {
  var ctx = canvas.getContext('2d');
  ctx.font = "18px NotoSansMyanmar";

  /* language-specifc font controls */
  if ($ && window) {
    $("#unicode, #zawgyi").change(function() {
      if ($("#zawgyi").prop("checked")) {
        $("input").addClass("zawgyi")
      } else {
        $("input").removeClass("zawgyi");
      }
    });

    if (window.location.href.toLowerCase().indexOf("zawgyi") > -1) {
      $("#zawgyi").prop("checked", true);
      $("input").addClass("zawgyi");
    }
  }

  game.setNumberTransform(function(txt) {
    return myanmarNumbers(txt, 'my');
  });
}

function languageTransform(word) {
  if ($("#zawgyi").prop("checked")) {
    return zg2uni(word);
  } else {
    return word;
  }
}
