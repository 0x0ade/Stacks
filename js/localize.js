/* global Localize */

Localize = window.Localize = {};

Localize.testing = true;
Localize.onstart = true;
Localize.delay = 0;
Localize.path = "./languages/";
Localize.handler = "POEditor";
Localize.fallbacklang = "en";

Localize.langs = {};
Localize.dynamic = {};
Localize.detected = navigator.language || navigator.userLanguage;
Localize.listeners = {get: [], geterror: [], add: [], localized: []};

Localize.handlers = {
  "default": null,
  "POEditor": function(lang, data) {
    var newdata = {};
    for (var ti = 0; ti < data.length; ti++) {
      var term = data[ti];
      if (!term.reference || term.reference.length == 0) {
        continue;
      }
      var subkeys = term.reference.split(".");
      var subkey = "";
      for (var i = 0; i < subkeys.length - 1; i++) {
        subkey += subkeys[i];
        eval("newdata."+subkey+" = newdata."+subkey+" || {}");
        subkey += ".";
      }
      if (term.reference.indexOf("[", subkey.length) > -1) {
        var arrayName = term.reference.substr(0, term.reference.indexOf("[", subkey.length));
        var arrayStr = "newdata."+arrayName;
        var array = eval(arrayStr+" = "+arrayStr+" || []");
        var newLength = parseInt(term.reference.substr(term.reference.indexOf("[", subkey.length) + 1, term.reference.indexOf("[", subkey.length) - 1)) + 1;
        for (var i = array.length; i < newLength; i++) {
          array.push(null);
        }
      }
      if (term.definition.indexOf("[...]") > -1) {
        term.definition = term.definition.split("[...]");
      }
      eval("newdata."+term.reference+" = term.definition");
    }
    return newdata;
  }
};

function localized(key) {
  var val;
  try {
    if ((val = eval("Localize.dynamic."+Localize.detected+"."+key)) != null) {
      return val;
    }
  } catch (e) {};
  try {
    if ((val = eval("Localize.dynamic."+Localize.fallbacklang+"."+key)) != null) {
      return val;
    }
  } catch (e) {};
  try {
    if ((val = eval("Localize.lang."+key)) != null) {
      return val;
    }
  } catch (e) {};
  try {
    if ((val = eval("Localize.fallback."+key)) != null) {
      return val;
    }
  } catch (e) {};
  console.log("localize: not found: ["+key+"]");
  return "["+key+"]";
};

Localize.localizeAll = function() {
  var localize_ = function() {
    //backwards-compatibility
    $("[localize]").each(function() {
      var self = $(this);
      var key = self.attr("localize");
      var attr = self.attr("localize-attr");
      if (!attr) {
        self.text(localized(key));
      } else {
        self.attr(attr, localized(key));
      }
    });
    //new format
    $("[data-localize]").localize();
  };
  
  if (Localize.lang != null) {
    localize_();
    return;
  }
  
  Localize.getLanguage(Localize.fallbacklang, function(data) {
    Localize.fallback = data;
    localize_();
  }, function(jqxhr, textStatus, error) {
    console.log("Failed loading locale: "+Localize.fallbacklang);
    console.log(textStatus, error);
    if (!Localize.testing) {
      alert("Failed loading the website texts. Please contact the site administrator.");
    } else {
      localize_();
    }
  });
  
  Localize.getLanguage(navigator.language || navigator.userLanguage, function(data) {
    Localize.lang = data;
    localize_();
  });
};

Localize.getLanguage = function(lang, cb, fail, handler) {
  Localize.langs[lang] = Localize.langs[lang] || {};
  handler = handler || Localize.handlers[Localize.handler] || Localize.handlers["default"]
  $.getJSON(Localize.path+lang+".json", function(data) {
    data = handler(lang, data);
    Localize.langs[lang] = data;
    if (cb) {
      cb(data);
    }
    Localize.callListeners(Localize.listeners.get, lang, data);
  }).fail(fail || function(jqxhr, textStatus, error) {
    console.log("Failed loading locale: en");
    console.log(textStatus, error);
    Localize.callListeners(Localize.listeners.geterror, lang, jqxhr, textStatus, error);
    if (Localize.testing) {
      if (cb) {
        cb(null);
      }
    }
  });
}

Localize.addTranslation = function(lang, key, value) {
  Localize.dynamic[lang] = Localize.dynamic[lang] || {};
  
  var subkeys = key.split(".");
  var subkey = "";
  for (var i = 0; i < subkeys.length; i++) {
    subkey += subkeys[i];
    eval("Localize.dynamic."+lang+"."+subkey+" = Localize.dynamic."+lang+"."+subkey+" || {}");
    subkey += ".";
  }
  eval("Localize.dynamic."+lang+"."+key+" = value");
  
  Localize.callListeners(Localize.listeners.add, lang, key, value);
}

$.fn["localize"] = function() {
  return this.each(function() {
    var self = $(this);
    var data = self.attr("data-localize");
    try {
      data = JSON.parse(data);
      for (var p in data) {
        if (!data.hasOwnProperty(p)) {
          continue;
        }
        if (p == "_text") {
          self.text(localized(data["_text"]));
        } else {
          self.attr(p, localized(data[p]));
        }
        Localize.callListeners(Localize.listeners.localized, self, data, p);
      }
    } catch (e) {
      self.text(localized(data));
    }
  });
}

Localize.callListeners = function() {
  var listeners = arguments[0];
  
  var args = new Array(arguments.length - 1);
  for (var i = 0; i < args.length; i++) {
    args[i] = arguments[i+1];
  }
  
  for (var i = 0; i < listeners.length; i++) {
    listeners[i].apply(this, args);
  }
}

if (Localize.onstart) {
  setTimeout(Localize.localizeAll, Localize.delay);
}
