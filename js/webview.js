/* global webview */

webview = window.webview = Stacks.webview = {};

webview.buttonsDOM = $("#app-webview-buttons");
webview.holderDOM = $("#webview-holder");
webview.DOM = null;

webview.open = function(url) {
  if (webview.DOM == null) {
    webview.DOM = $("<webview src=\"" + encodeHTML(url) + "\" preload=\"./preload_webview.js\"></webview>")
    webview.holderDOM.append(webview.DOM);
    // webview doesn't like velocity
    webview.DOM[0].style.animationName  = "webview-open";
    webview.DOM[0].style.animationPlayState = "playing";
    // buttons don't like css
    webview.buttonsDOM.velocity({
      "opacity": 1
    });
  } else {
    webview.DOM[0].loadURL(url);
  }

  document.children[0].setAttribute("inwebview", true);
};

webview.close = function() {
  if (webview.DOM == null) return;
  var dom = webview.DOM;
  webview.DOM = null;

  dom[0].style.animationNameloadURL = "webview-close";
  dom[0].style.animationPlayState = "playing";

  webview.buttonsDOM.velocity({
    "opacity": 0
  });

  setTimeout(function() {
    dom.remove();
    document.children[0].setAttribute("inwebview", false);
  }, 300);
};
