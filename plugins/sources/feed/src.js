/* global feed */

feed = Stacks.sources["feed"] = {
  id: "feed",
  name: "RSS feed",
  theme: {
    bg: "#fff",
    fg: "#000"
  },
  priority: -1,
  genCard: function(q) {
    return new Promise(function(resolve, reject) {
      $.getJSON("https://kgsearch.googleapis.com/v1/entities:search?callback=?", 
        {
          "languages": Stacks.lang,
          "query": q,
          "limit": 1,
          "indent": true,
          "key": Stacks.plugins["core.source.wikipedia"].kgsearch.key,
        },
        function(response) {
          Stacks.logt("kgsearch: response", response);
          if (response.itemListElement.length == 0) {
            reject();
            return;
          }
          var card = response.itemListElement[0].result;
          if (card.name == null) {
            reject();
            return;
          }
          card.resultScore = response.itemListElement[0].resultScore;
          
          card.title = encodeHTML(card.name);
          card.subtitle = encodeHTML(card.description);
          
          if (card.detailedDescription != null) {
            card.body = "<p>"+card.detailedDescription.articleBody.replace("\n", "<br>")+"</p>"; //kgsearch already gives encoded output
          }
          
          if (card.image != null) {
            card.img = {
              url: card.image.contentUrl
            };
          }
          
          resolve(card);
      }).fail(reject);
    });
  },
  genCards: function(q) {
    return new Promise(function(resolve, reject) {
      kgsearch.genCard(q).then(function(card) {
        resolve([card]);
      }, reject);
    });
  },
  genDOM: Stacks.genBasicCardDOM
};

//WIKIPEDIA
/* global wikipedia */

wikipedia = Stacks.sources["wikipedia"] = {
  id: "wikipedia",
  altsources: ["kgsearch"], //alternatives for when Wikipedia gives up
  name: "Wikipedia",
  theme: {
    bg: "#fff",
    fg: "#000"
  },
  priority: 1,
  getURL: function() {
    return "https://"+Stacks.lang+".wikipedia.org/w/api.php?continue=&callback=?";
  },
  
  search: function(q) {
    return new Promise(function(resolve, reject) {
      $.getJSON(wikipedia.getURL(),
        {
          "format": "json",
          "formatversion": "2",
          "action": "query",
          "list": "search",
          "srsearch": q
        },
        function(response) {
          Stacks.logt("wikipedia: query search", response);
          
          if (response.query.search.length == 0) {
            reject(response);
            return;
          }
          
          resolve(response.search);
      }).fail(reject);
    });
  },
  
  query_: function(p) {
    return new Promise(function(resolve, reject) {
      $.getJSON(wikipedia.getURL(), 
        $.extend({
          "format": "json",
          "formatversion": "2",
          "action": "query"
        }, p.args || {}),
        function(response) {
          Stacks.logt("wikipedia: query", response);
          
          if (response.query == null) {
            reject();
          }
          
          for (var prop in response.query.pages) {
            if (response.query.pages.hasOwnProperty(prop) && response.query.pages[prop].pageid != null) {
              resolve(response.query.pages);
              return;
            }
          }
          
          reject();
      }).fail(reject);
    });
  },
  
  query: function(p) {
    p.args = $.extend({"titles": p.q}, p.args || {});
    return wikipedia.query_(p);
  },
  
  querySearch: function(p) {
    p.args = $.extend({
      "generator": "search",
      "gsrlimit": (p.amount || 1).toString(),
      "gsrsearch": p.q
    }, p.args || {});
    return wikipedia.query_(p);
  },
  
  queryForCard: function(p) {
    p.amount = 3;
    p.args = $.extend({
      "prop": "pageimages|pageprops|extracts",
      "exintro": "",
      "explaintext": "",
      "excontinue": "",
      "exlimit": p.amount.toString(),
      "redirects": "1",
      "pithumbsize": (p.size || 650).toString()
    }, p.args || {});
    return wikipedia.querySearch(p);
  },
  
  genCards: function(q) {
    return new Promise(function(resolve, reject) {
      wikipedia.queryForCard({q: q}).then(function(cards) {
        var disambiguation = cards.length == 0;
        for (var ci = 0; ci < cards.length; ++ci) {
          if (cards[ci].pageprops.disambiguation != null) {
            disambiguation = true;
            break;
          }
        }
        
        if (disambiguation) {
          //We're moving over!
          var i = -1;
          var step = function() {
            ++i;
            if (wikipedia.altsources.length <= i) {
              reject();
              return;
            }
            
            var source = Stacks.sources[wikipedia.altsources[i]];
            if (source == null) {
              step();
            }
            Stacks.logt("wikipedia: passing on", source.id, q);
            source.genCard(q).then(function(card) {
              card.altSource = source.id;
              resolve([card]);
            }, function() {
              step();
            });
          };
          step();
          return;
        }
        
        for (var ci = 0; ci < cards.length; ++ci) {
          var card = cards[ci];
          
          Stacks.logt("wikipedia: card", ci, card);
          
          if (card.pageprops.disambiguation != null) {
            cards.splice(ci, 1);
            --ci;
            continue;
          }
          
          card.url = "https://"+Stacks.lang+".wikipedia.org/wiki/"+encodeURI(card.title);
          card.origTitle = card.title;
          card.title = encodeHTML(card.title);
          
          //wikipedia only gives encoded output with plain extracts
          //var extract = $(card.extract).first().text();
          var extract = card.extract;
          
          if (260 < extract.length) {
            extract = extract.substring(0, extract.indexOf(".", 140) + 1);
          }
          
          card.body = "<p>"+extract.replace("\n", "<br>")+"</p>";
          
          if (card.thumbnail != null) {
            card.img = {
              url: card.thumbnail.source,
              width: card.thumbnail.width,
              height: card.thumbnail.height
            };
          }
        }
        
        resolve(cards);
      }, reject);
    });
  },
  genDOM: Stacks.genBasicCardDOM
};
