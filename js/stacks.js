/* global Stacks */
/* global encodeHTML */

//Small strip-json-comments behavior change, which will kill me in the future:
//Force JSON.parse to strip the comments
(function() {
  var __o_JSON_parse = JSON.parse;
  JSON.parse = function() {
    if (0 < arguments.length && typeof arguments[0] == "string") {
      arguments[0] = stripJsonComments(arguments[0]);
    }
    return __o_JSON_parse.apply(this, arguments);
  };
})();

Stacks = window.Stacks = {};
Stacks.v = 0;
Stacks.testing = true;
Stacks.testingLogToToast = false;

Stacks.lang = Localize.detected;

encodeHTML = window.encodeHTML = Stacks.encodeHTML = function(s) {
  if (s == null) {
    return s;
  }
  return s.replace(/[\x26\x0A\<>'"]/g, function(c) {
    return "&#" + c[0] + ";"
  }).replace("&#\n;", "<br>");
};

Stacks.genCall = function() {
  var f = arguments[0];
  var args = Array.from(arguments);
  args.splice(0, 1);
  return function() {return f.apply(this, args);}
};
Stacks.genPromise = function() {
  var call = Stacks.genCall.apply(this, arguments);
  return new Promise(function(resolve, reject) {
    resolve({genPromise: "true", r: call()});
  });
};

Stacks.info = function(msg) {
  console.log("stacks: i", msg);
  Materialize.toast(msg, 5000);
};
Stacks.warn = function(msg) {
  console.log("stacks: w", msg);
  Materialize.toast(msg, 5000, "yellow darken-4");
};
Stacks.error = function(msg) {
  console.log("stacks: e", msg);
  Materialize.toast(msg, 5000, "red darken-4");
};
Stacks.logt = function() {
  if (!Stacks.testing) {
    return;
  }
  console.log.apply(console, arguments);
  try {
    var msg = "";
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (typeof arg == "string") {
        //uhh...
      } else if (arg == undefined) {
        arg = arg === undefined ? "undefined" : "null?";
      } else if (typeof arg == "function") {
        arg = arg.toString();
      } else if (arg.length != undefined) {
        arg = JSON.stringify(arg);
        if (arg == "[]") {
          arg = arguments[i].toString();
        } else if (400 < arg.length) {
          arg = "[...]";
        }
      } else {
        arg = JSON.stringify(arg);
        if (arg == "{}") {
          arg = arguments[i].toString();
        } else if (400 < arg.length) {
          arg = "{...}";
        }
      }
      msg += arg;
      msg += " ";
    }
  } catch (e) {
    console.log("stacks: logt failed", e);
    if (Stacks.testingLogToToast) {
      Materialize.toast("logt failed: " + e, 10000, "blue darken-4");
    }
  }
  if (Stacks.testingLogToToast) {
    Materialize.toast(msg, 10000, "green darken-4");
  }
};

Stacks.settings = {
  v: Stacks.v,
  pluginURLs: [
    "./plugins/sources/wikipedia/meta.json",
    
    "./plugins/themes/google/meta.json"
  ],
  themes: [
    "core.theme.google"
  ]
};

Stacks.plugins = {};
Stacks.sources = {};
Stacks.themes = {};

Stacks._sourcesTMP = {};
Stacks._sourcesTMPSort = [];
Stacks.getSourcesSorted = function() {
  var valid = true;
  
  for (var id in Stacks.sources) {
    if (!Stacks.sources.hasOwnProperty(id)) {
      continue;
    }
    if (Stacks._sourcesTMP[id] == undefined || Stacks._sourcesTMP[id] != Stacks.sources[id].priority) {
      valid = false;
    }
  }
  
  if (!valid) {
    Stacks._sourcesTMP = {};
    Stacks._sourcesTMPSort = [];
    for (var id in Stacks.sources) {
      if (!Stacks.sources.hasOwnProperty(id)) {
        continue;
      }
      var p = Stacks.sources[id].priority;
      Stacks._sourcesTMP[id] = p;
      if (0 <= p) {
        Stacks._sourcesTMPSort.push({id: id, priority: p});
      }
    }
    Stacks._sourcesTMPSort.sort(function(a, b) {
      return a.priority - b.priority;
    });
    
    for (var i = 0; i < Stacks._sourcesTMPSort.length; ++i) {
      Stacks._sourcesTMPSort[i] = Stacks.sources[Stacks._sourcesTMPSort[i].id];
    }
  }
  
  return Stacks._sourcesTMPSort;
};

Stacks.headDOM = $(document.head);

Stacks.headerBGDOM = $("#header-bg");
Stacks.headerLogoDOM = $("#header-logo");

Stacks.searchDOM = $("#search");
Stacks.searchY = Stacks.searchDOM.offset().top;
Stacks.searchSticky = false;
Stacks.searchOffset = 16;

Stacks.progressDOM = $("#search .progress");
Stacks.showProgress = function(show) {
  if (show == null) {
    show = true;
  }
  Stacks.progressDOM.css("opacity", show ? 1 : 0);
};
Stacks.hideProgress = function() {
  Stacks.showProgress(false);
};

Stacks.qDOM = $("#search #q");
Stacks.getQ = function() {
  return Stacks.qDOM[0].value;
};
Stacks.setQ = function(q) {
  Stacks.qDOM[0].value = q;
};

Stacks.stacks = [];
Stacks.cards = [];

Stacks._parallaxbg = $(".parallaxbg");

Stacks.stacksDOM = $("#main-inner");
Stacks.stacksDOM.shapeshift({
  states: {
    "default": {
      "class": "shapeshiftable",
      grid: {
        columns: null,
        itemWidth: 30,
        maxHeight: null,
        align: "center",
        origin: "nw",
        gutter: {
          x: 0,
          y: 32
        },
        padding: {
          x: 0,
          y: 0
        }
      },
      responsive: {
        enabled: true,
        refreshRate: 50
      },
      resize: {
        handle: ".resizeToggle",
        enabled: true,
        refreshRate: 50,
        sizes: null,
        increment: {
          x: 40,
          y: 1
        },
        min: {
          h: 40,
          w: 30
        },
        renderOn: "mouseup"
      },
      draggable: {
        enabled: true
      },
      extras: {
        indexDisplay: null
      }
    }
  }
});
Stacks.shapeshift = Stacks.stacksDOM.data("plugin_shapeshift");
Stacks.refreshShapeshift = function() {
  //shapeshift hates stacks - we need to forcibly refresh the height
  for (var i = 0; i < Stacks.shapeshift.children.length; i++) {
    var child = Stacks.shapeshift.children[i];
    child.h = child.el.outerHeight();
  }
  
  Stacks.shapeshift._calculateGrid();
  Stacks.shapeshift._toggleFeatures();
  Stacks.shapeshift._setIndexes();
  Stacks.shapeshift.render();
};
Stacks.refreshStacks = function() {
  for (var i = 0; i < Stacks.stacks.length; i++) {
    var stack = Stacks.stacks[i];
    stack.id = i;
    if (stack.DOM != null) {
      stack.DOM.attr("data-stack-id", i);
    }
    Stacks.updateCardPositions(stack);
  }
};
Stacks.refreshCards = function() {
  for (var i = 0; i < Stacks.cards.length; i++) {
    var card = Stacks.cards[i];
    card.id = i;
    if (card.DOM != null) {
      card.DOM.attr("data-card-id", i);
    }
  }
};
Stacks.refresh = function() {
  Stacks.refreshStacks();
  Stacks.refreshCards();
  Stacks.refreshShapeshift();
  
  Stacks._parallaxbg = $(".parallaxbg");
};

Stacks.genCardDOM = function(card) {
  if (Stacks.sources[card.source] == null) {
    Stacks.error("Could not find source \"" + card.source + "\" for \"" + card.q + "\"!");
    return null;
  }
  
  card.DOM = Stacks.sources[card.source].genDOM(card);
  
  var actions = $("<div class=\"card-actions\"></div>");
  card.DOM.append(actions);
  
  var action;
  
  if (card.actions != null) {
    //TODO add, test card.actions
  }
  
  action = $("<i class=\"material-icons md-18\">close</i>");
  action.addClass("tooltipped").attr({
    "data-position": "top",
    "data-delay": "50",
    "data-localize": '{"data-tooltip": "stack.remove"}'
  }).localize().tooltip();
  actions.append(action);
  action.on("click", Stacks.genCall(Stacks.removeCard, card));
  
  card.DOM.attr("data-card-source", card.source);
  
  return card.DOM;
};
Stacks.genBasicCardDOM = function(card) {
  if (Stacks.sources[card.source] == null) {
    Stacks.error("Could not find source \"" + card.source + "\" for \"" + card.q + "\"!");
    return null;
  }
  
  var title = "<span class=\"card-title\">" + card.title + "</span>";
  var subtitle = "";
  var body = "";
  
  if (card.url != null) {
    title = "<a href=\"" + encodeHTML(card.url) + "\" class=\"card-title\">" + card.title + "</a>";
  }
  
  if (card.description != null) {
    //TODO add subheader
    subtitle = "";
  }
  
  if (card.body != null) {
    body = card.body;
  }
  
  var theme = card.theme || Stacks.sources[card.source].theme.card;
  if (theme != null) {
    theme = " " + theme;
  } else {
    theme = "";
  }
  
  var cardDOM = $("<div class=\"card" + theme + "\"><div class=\"card-content\">" + title + subtitle + body + "</div></div>");
  
  if (card.img != null) {
    //TODO add image
    cardDOM.addClass("parallaxbg")
      .css({
        "background-image": "url(" + card.img.url + ")",
        "background-size": card.img.width + "px " + card.img.height + "px"
      });
    
    if (card.img.color == null) {
      //TODO FIXME LEFT HERE
      //Stacks.getCardImageColor(card).then(Stacks.showImage);
    } else {
      //Stacks.showImage(card);
    }
  }
  
  return cardDOM;
};
Stacks.moveCard = function(_card_stack, _ni_card, _ni) {
  var stack;
  var card;
  var ni;
  if (typeof _ni_card == "number" && (typeof _card_stack == "object" && _card_stack.cards != null)) {
    stack = _card_stack;
    if (_ni_card < 0) {
      _ni_card = _card_stack.cards.length + _ni_card;
    }
    card = _card_stack.cards[_ni_card];
    ni = _ni;
  } else {
    card = _card_stack;
    stack = Stacks.stacks[_card_stack.stack];
    ni = _ni_card;
  }
  if (ni == null) {
    ni = card.index == 0 ? stack.cards.length - 1 : 0;
  }
  stack.cards.splice(card.index, 1);
  stack.cards.splice(ni, 0, card);
  
  Stacks.refresh();
};
Stacks.updateCardPositions = function(stack) {
  if (typeof stack == "number") {
    stack = Stacks.stacks[stack];
  }
  for (var i = 0; i < stack.cards.length; i++) {
    var card = stack.cards[i];
    card.stack = stack.id;
    card.index = i;
    card.DOM.attr("data-stack-id", stack.id).attr("data-stack-index", i);
    Stacks.updateCardPosition(card);
  }
};
Stacks.updateCardPosition = function(card) {
  var i = card.index;
  if (0 < i) {
    var f = 1 / ((i + 16) / 16);
    card.DOM.attr("data-stack-hidden", "")
      .css({
        "z-index": -i,
        "transform": "scale(" + f + ") translateY(" + ((i - 1) * 8 + f * 8) + "px)"
      });
  } else {
    card.DOM.attr("data-stack-hidden", null)
      .css({
        "z-index": 1,
        "transform": "scale(1) translateY(0px)"
      });
  }
};
Stacks.genStackDOM = function(stack) {
  stack.DOM = $("<div class=\"stack\"></div>");
  
  var header = $("<p class=\"stack-header\">"+encodeHTML(stack.q)+"</p>");
  
  var actions = $("<div class=\"stack-actions\"></div>");
  header.append(actions);
  
  var action;
  action = $("<i class=\"material-icons\">keyboard_arrow_up</i>");
  action.addClass("tooltipped").attr({
    "data-position": "top",
    "data-delay": "50",
    "data-localize": '{"data-tooltip": "stack.card.next"}'
  }).localize().tooltip();
  actions.append(action);
  action.on("click", function() {
    Stacks.moveCard(stack, 0);
  });
  
  action = $("<i class=\"material-icons\">keyboard_arrow_down</i>");
  action.addClass("tooltipped").attr({
    "data-position": "top",
    "data-delay": "50",
    "data-localize": '{"data-tooltip": "stack.card.previous"}'
  }).localize().tooltip();
  actions.append(action);
  action.on("click", function() {
    Stacks.moveCard(stack, -1);
  });
  
  action = $("<i class=\"material-icons\">close</i>");
  action.addClass("tooltipped").attr({
    "data-position": "top",
    "data-delay": "50",
    "data-localize": '{"data-tooltip": "stack.remove"}'
  }).localize().tooltip();
  actions.append(action);
  action.on("click", Stacks.genCall(Stacks.removeStack, stack));
  
  stack.DOM.append(header);
  
  for (var i = 0; i < stack.cards.length; ++i) {
    var card = stack.cards[i];
    if (card.DOM == null) {
      card.DOM = Stacks.genCardDOM(card);
    }
    Stacks.updateCardPosition(card);
    stack.DOM.append(card.DOM);
  }
  
  return stack.DOM;
};
Stacks.addStack = function(stack, loading) {
  return new Promise(function(resolve, reject) {
    if (stack.DOM == null) {
      stack.DOM = Stacks.genStackDOM(stack);
    }
    
    if (!loading) {
      stack.id = Stacks.stacks.length;
      Stacks.stacks.push(stack);
    }
    stack.DOM.attr("data-stack-id", stack.id);
    
    for (var i = 0; i < stack.cards.length; i++) {
      var card = stack.cards[i];
      card.stack = stack.id;
      card.DOM.attr("data-stack-id", stack.id).attr("data-card-id", card.id);
      if (!loading) {
        card.id = Stacks.cards.length + i;
      }
    }
    if (!loading) {
      Stacks.cards.push.apply(Stacks.cards, stack.cards);
    }
    Stacks.stacksDOM.append(stack.DOM);
    
    Stacks.updateCardPositions(stack);
    
    //Stacks.shapeshift.addChild(stack.DOM);
    //shapeshift only allows adding as last; we want to add as first!
    var ssid = parseInt(stack.DOM.attr("data-ssid"));
    if (isNaN(ssid)) {
      stack.DOM.attr("data-ssid", ssid = ++Stacks.shapeshift.idCount);
      for (var i = 0; i < Stacks.shapeshift.children.length; ++i) {
        ++Stacks.shapeshift.children[i].index;
      }
      Stacks.shapeshift.children.splice(0, 0, {
        id: ssid,
        index: 0,
        el: stack.DOM,
        x: 0,
        y: 0,
        initialized: false,
        state: null
      });
      Stacks.shapeshift._parseChild(ssid);
    }
    
    Stacks.refreshShapeshift();
    
    if (!loading) {
      Stacks.save();
    }
    
    resolve(stack);
  });
};
Stacks.genStack = function(p) {
  p = p || {};
  return new Promise(function(resolve, reject) {
    resolve({q: p.q || "", cards: p.cards || []});
  });
};
Stacks.addCard = function(p) {
  return new Promise(function(resolve, reject) {
    if (p.card.DOM == null) {
      p.card.DOM = Stacks.genCardDOM(p.card);
    }
    
    p.stack.cards.push(p.card);
    p.stack.DOM.append(p.card.DOM);
    
    p.card.stack = p.stack.id;
    p.card.id = Stacks.cards.length;
    p.card.DOM.attr("data-stack-id", p.stack.id).attr("data-card-id", p.card.id);
    Stacks.cards.push(p.card);
    
    Stacks.updateCardPositions(p.stack);
    
    Stacks.refreshShapeshift();
    
    Stacks.save();
    
    resolve(p);
  });
};
Stacks.genCards = function(p) {
  return new Promise(function(resolve, reject) {
    var sources = Stacks.getSourcesSorted();
    p.cards = [];
    
    var i = -1;
    var step = function() {
      ++i;
      if (sources.length <= i || (p.count != null && p.count <= p.cards.length)) {
        if (p.cards.length == 0) {
          reject(p);
        } else {
          if (p.count != null && p.count < p.cards.length) {
            p.cards.splice(p.count);
          }
          resolve(p);
        }
        return;
      }
      
      var source = sources[i];
      source.genCards(p.q).then(function(cards) {
        if (cards != null && 0 < cards.length) {
          for (var ci = 0; ci < cards.length; ++ci) {
            var card = cards[ci];
            card.source = source.id;
            card.q = p.q;
          }
          p.cards.push.apply(p.cards, cards);
        }
        step();
      }, step);
    };
    step();
  });
};
Stacks.genCard = function(p) {
  p.count = 1;
  return Stacks.genCards(p);
};

Stacks.removeStack = function(stack) {
  if (typeof stack == "number") {
    stack = Stacks.stacks[stack];
  }
  
  stack.DOM.velocity({
    "opacity": 0
  }, {
    duration: 200,
    complete: function() {
      stack.DOM.find(".tooltipped").tooltip("remove");
      Stacks.stacks.splice(stack.id, 1);
      for (var i = 0; i < stack.cards.length; i++) {
        Stacks.cards.splice(stack.cards[i].id, 1);
      }
      //shapeshift doesn't "support" removal
      //... yet it's still possible
      Stacks.shapeshift.children.splice(
        Stacks.shapeshift.children.indexOf(
          Stacks.shapeshift._getChildById(
            parseInt(stack.DOM.attr("data-ssid")))
          )
      , 1);
      stack.DOM.remove();
      Stacks.refresh();
      Stacks.save();
    }
  });
};
Stacks.removeCard = function(card) {
  if (typeof card == "number") {
    card = Stacks.cards[card];
  }
  
  card.DOM.velocity({
    "opacity": 0
  }, {
    duration: 200,
    complete: function() {
      card.DOM.find(".tooltipped").tooltip("remove");
      Stacks.cards.splice(card.id, 1);
      var stack = Stacks.stacks[card.stack];
      stack.cards.splice(card.index, 1);
      card.DOM.remove();
      if (stack.cards.length == 0) {
        Stacks.removeStack(stack);
      } else {
        Stacks.refresh();
        Stacks.save();
      }
    }
  });
};

Stacks.containsQ = function(list, q, caseSensitive) {
  caseSensitive = caseSensitive != null && caseSensitive;
  if (!caseSensitive) {
    q = q.toLowerCase();
  }
  if (!caseSensitive) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].q.toLowerCase() == q) {
        return true;
      }
    }
  } else {
    for (var i = 0; i < list.length; i++) {
      if (list[i].q == q) {
        return true;
      }
    }
  }
  return false;
};
Stacks.containsQStack = function(q, caseSensitive) {
  return Stacks.containsQ(Stacks.stacks, q, caseSensitive);
};
Stacks.containsQCard = function(q) {
  return Stacks.containsQ(Stacks.cards, q, caseSensitive);
};

Stacks.addStackFromQ = function(q, resolve, reject) {
  if (typeof q != "string") {
    q = Stacks.getQ();
    Stacks.setQ("");
  }
  
  if (q == null || q.length == 0) {
    return;
  }
  
  if (Stacks.containsQStack(q)) {
    if (reject != null) {
      reject();
    }
    return;
  }
  
  Stacks.showProgress();
  var rejectHideProgress = function() {
    Stacks.hideProgress();
    if (reject != null) {
      return reject.apply(this, arguments);
    }
  }
  
  var promise = Stacks.genCards({q: q}).then(Stacks.genStack, rejectHideProgress).then(Stacks.addStack, rejectHideProgress).then(Stacks.hideProgress, Stacks.hideProgress);
  if (resolve != null || reject != null) {
    promise.then(resolve, reject);
  }
};

Stacks.onSearch = function(q) {
  if (typeof q != "string") {
    q = Stacks.getQ();
    //Stacks.setQ("");
  }
  
  if (q == null || q.length == 0) {
    return;
  }
  
  Stacks.settings.lastSearch = q;
  Stacks.save();
  Stacks.search(q);
};
Stacks.search = function(q) {
  //Primitive Google search - plugins may replace this.
  window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(q);
};

Stacks.save = function() {
  Stacks.logt("stacks: saving");
  
  Stacks.settings.v = Stacks.v;
  localStorage["Stacks.settings"] = JSON.stringify(Stacks.settings);
  
  Stacks.stacks.sort(function(a, b) {
    //reverse!
    return Stacks.shapeshift._getChildById(parseInt(b.DOM.attr("data-ssid"))).index
      - Stacks.shapeshift._getChildById(parseInt(a.DOM.attr("data-ssid"))).index;
  });
  for (var i = 0; i < Stacks.stacks.length; i++) {
    var stack = Stacks.stacks[i];
    stack.id = i;
    for (var ci = 0; ci < stack.cards.length; ci++) {
      var card = stack.cards[ci];
      card.stack = i;
    }
  }
  
  localStorage["Stacks.stacks"] = JSON.stringify(Stacks.stacks, function(key, value) {
    if (key == "id" || key == "index" || key == "DOM") {
      return undefined;
    }
    return value;
  });
};
Stacks.load = function() {
  Stacks.showProgress();
  var data;
  
  data = localStorage["Stacks.settings"];
  if (data != null) {
    Stacks.settings = JSON.parse(data);
    if (Stacks.settings.v < Stacks.v) {
      Stacks.info("Hey, Stacks got an update! Take a look at the changelog.");
      Stacks.info("If you're having problems with Stacks, try resetting your settings.");
    }
  }
  
  data = localStorage["Stacks.stacks"]
  if (data != null) {
    data = JSON.parse(data);
    Stacks.logt("stacks: loading", data);
    
    Stacks.initPlugins().then(function() {
      Stacks.stacks = data;
      
      for (var i = 0; i < Stacks.stacks.length; i++) {
        var stack = Stacks.stacks[i];
        stack.id = i;
        
        for (var ci = 0; ci < stack.cards.length; ci++) {
          var card = stack.cards[ci];
          card.id = Stacks.cards.length;
          card.index = ci;
          card.DOM = Stacks.genCardDOM(card);
          
          Stacks.cards.push(card);
        }
        
        stack.DOM = Stacks.genStackDOM(stack);
        Stacks.addStack(stack, true);
      }
      
      Stacks.hideProgress();
      
      if (Stacks.settings.lastSearch != null) {
        Stacks.addStackFromQ(Stacks.settings.lastSearch);
        delete Stacks.settings.lastSearch;
      }
      
      Stacks.refresh();
    }, Stacks.hideProgress);
    
  } else {
    Stacks.initPlugins().then(Stacks.hideProgress, Stacks.hideProgress);
  }
  
  Stacks.refresh();
};

Stacks.initPluginJS = function(plugin) {
  return new Promise(function(resolve, reject) {
    if (plugin.js == null) {
      resolve(plugin);
      return;
    }
    $.ajax({
      url: plugin.js,
      dataType: "script",
      cache: true,
      success: function(src) {
        //jQuery already evals for us
        resolve(plugin);
      },
      error: Stacks.genCall(reject, plugin)
    });
  });
};
Stacks.initPluginCSS = function(plugin) {
  return new Promise(function(resolve, reject) {
    if (plugin.css == null) {
      resolve(plugin);
      return;
    }
    
    plugin.cssDOM = $("<link>");
    plugin.cssDOM.attr({
      "rel": "stylesheet",
      "id": "stacks-style-" + plugin.id,
      "href": plugin.css
    });
    Stacks.headDOM.append(plugin.cssDOM);
    
    var theme = Stacks.themes[plugin.id];
    if (theme != null) {
      theme.cssDOM = plugin.cssDOM;
    } else {
      plugin.cssDOM.attr("ref", "stylesheet");
    }
    
    resolve(plugin);
  });
};
Stacks.initPlugins = function() {
  return new Promise(function(resolve, reject) {
    var pluginURLs = Stacks.settings.pluginURLs;
    Stacks.logt("stacks: initializing plugins", pluginURLs);
    
    var i = -1;
    var step = function() {
      ++i;
      if (pluginURLs.length <= i) {
        Stacks.refreshThemes();
        resolve();
        return;
      }
      
      Stacks.logt("stacks: trying plugin", i, pluginURLs[i]);
      $.getJSON(pluginURLs[i], function(plugin) {
        Stacks.logt("stacks: got plugin data", i, plugin);
        Stacks.plugins[plugin.id] = plugin;
        Stacks.initPluginJS(plugin).then(Stacks.initPluginCSS, step).then(step, step);
      }).fail(step);
    };
    
    step();
  });
};

Stacks.refreshTheme = function(theme) {
  if (typeof theme == "string") {
    theme = Stacks.themes[theme];
  }
  
  if (Stacks.settings.themes.indexOf(theme.id) < 0) {
    theme.cssDOM.attr("rel", "nostylesheet");
    theme.disable();
  } else {
    theme.cssDOM.attr("rel", "stylesheet");
    theme.enable();
  }
};
Stacks.refreshThemes = function() {
  for (var id in Stacks.themes) {
    if (!Stacks.themes.hasOwnProperty(id)) {
      continue;
    }
    Stacks.refreshTheme(id);
  }
};

//GENERAL SETUP

(function() {
  var __o__toggleChildState = Stacks.shapeshift._toggleChildState;
  Stacks.shapeshift._toggleChildState = function(id, enabled, state) {
    var val = __o__toggleChildState.apply(this, arguments);
    
    if (!enabled && state == "dragging") {
      Stacks.save();
    }
    
    return val;
  }
})();

window.addEventListener("scroll", function() {
  Stacks.headerBGDOM.css("transform", "translateY(" + (-document.body.scrollTop * 0.2) + "px)");
  
  Stacks._parallaxbg.each(function(i) {
    this.style["background-position"] = "50% calc(50% + " + ((document.body.scrollTop - this.getBoundingClientRect().top) * 0.05) + "px)";
  });
  
  if (Stacks.searchY - Stacks.searchOffset <= document.body.scrollTop && !Stacks.searchSticky) {
    Stacks.searchSticky = true;
    Stacks.searchDOM.css("position", "fixed").css("top", Stacks.searchOffset);
  } else if (document.body.scrollTop < Stacks.searchY - Stacks.searchOffset && Stacks.searchSticky) {
    Stacks.searchSticky = false;
    Stacks.searchDOM.css("position", "").css("top", "");
  }
});

$("#search>input").autocomplete({
  source: function(request, response) {
    $.ajax({
      url: "https://suggestqueries.google.com/complete/search?client=chrome&q=" + encodeURIComponent(request.term),
      dataType: "jsonp",
      cache: true,
      success: function(data) {
        response(data[1]);
      }
    });
  },
  minLength: 3,
  delay: 0,
  appendTo: "#search"
});


$("#card-add").on("click", Stacks.addStackFromQ);

//TESTING CODE
if (Stacks.testing) {
  Stacks.warn("Testing mode!");
  /*Stacks.sources["testing"] = {
    id: "testing",
    theme: {
      bg: "#f44336",
      fg: "#fff",
      card: "yellow darken-4 white-text"
    },
    priority: 100,
    genCards: function(q) {
      return new Promise(function(resolve, reject) {
        resolve([{title: encodeHTML(q), body: "<p>This is just a test card.</p>"}]);
      });
    },
    genDOM: Stacks.genBasicCardDOM
  }*/
}

Stacks.load();
