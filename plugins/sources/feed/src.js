/* global feed */

feed = Stacks.sources["feed"] = {
  id: "feed",
  name: "RSS feed",
  theme: {
    bg: "#fff",
    fg: "#000"
  },
  priority: 1,

  refreshCard: function(card) {

  },

  load: function(p) {
    return new Promise(function(resolve, reject) {
      $.getJSON("https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?", 
        $.extend({
          "num": "3",
          "q": p.q
        }, p.args || {}),
        function(response) {
          Stacks.logt("feed: load", response);
          
          if (response.responseStatus != 200) {
            reject();
            return;
          }
          
          resolve(response.responseData.feed);
      }).fail(reject);
    });
  },

  find: function(p) {
    return new Promise(function(resolve, reject) {
      $.getJSON("https://ajax.googleapis.com/ajax/services/feed/find?v=1.0&callback=?", 
        $.extend({
          "q": p.q
        }, p.args || {}),
        function(response) {
          Stacks.logt("feed: find", response);
          
          if (
            response.responseStatus != 200 ||
            response.responseData.entries.length == 0
          ) {
            reject();
            return;
          }
          
          resolve(response.responseData.entries[0]);
      }).fail(reject);
    });
  },

  loadOrFind: function(p) {
    return new Promise(function(resolve, reject) {
      feed.load(p).then(
        (feed) => resolve(feed), // Directly return feed.

        () => feed.find(p).then( // Find feed URL,
          (f) => feed.load({q: f.url}).then( // load feed from URL,
            (feed) => resolve(feed), // return feed.
            reject // Feed not loaded.
          ), reject // Feed not found.
        )
      );
    });
  },

  genCards: function(q) {
    return new Promise(function(resolve, reject) {
      feed.loadOrFind({q: q}).then(function(feed) {
        if (feed.entries.length == 0) {
            reject();
            return;
          }
          
          var cards = [];
          
          for (var i = 0; i < feed.entries.length; i++) {
            var card = feed.entries[i];

            card.feedUrl = feed.feedUrl;
            card.refreshing = true;
            card.index = i;

            card.url = card.link;

            // card.title already defined
            // card.subtitle = encodeHTML(card.contentSnippet);
            
            // card.body = "<p>"+card.content.replace("\n", "<br>")+"</p>";
            if (card.content == 0) continue;
            card.body = "<p>"+card.contentSnippet.replace("\n", "<br>")+"</p>";
            
            // TODO check if card.content contains img
            var indexOfImg = card.content.indexOf("<img ");
            if (indexOfImg != -1) {
              var indexOfSrcStart = card.content.indexOf(" src=\"", indexOfImg + 1) + 6;
              var indexOfSrcEnd = card.content.indexOf("\"", indexOfSrcStart + 1);
              card.img = {
                url: card.content.substring(indexOfSrcStart, indexOfSrcEnd)
              };
            }

            if (card.contentSnippet.length == 0) {
              card.isLinkCard = true;
            }

            cards.push(card);
          }
          
          if (cards.length == 0) reject();
          resolve(cards);
      }, reject);
    });
  },
  genDOM: Stacks.genBasicCardDOM
};
