//Example theme
exampleTheme = Stacks.themes["com.ade.stacks.source.barometer"] = {
  id: "com.ade.stacks.source.barometer", //Must be the same as above, which must be same as the plugin ID!
  name: "Example",
  
  //Invoked when enabling the theme.
  enable: function() {
    
  },
  
  //Invoked when disabling the theme.
  disable: function() {
    
  },
  
  //Invoked when displaying the settings menu.
  settings: function() {
    
  },
  
  //Invoked when the save button is pressed in the settings menu.
  settingsChanged: function() {
    
  }
  
};

//Example source.
example = Stacks.sources["example"] = {
  id: "example", //Must be the same as above.
  name: "Example",
  
  //Card theme.
  theme: {
    bg: "#f44336",
    fg: "#fff",
    card: "yellow darken-4 white-text" //Classes added to the card - create your own card theme or use Materialize
  },
  
  //Default source priority - negative sources are hidden from the user.
  priority: 100,
  
  //Invoked when generating cards for a given query (q).
  genCards: function(q) {
    return new Promise(function(resolve, reject) {
      resolve([{title: encodeHTML(q), body: "<p>This is just a test card.</p>"}]);
    });
  },
  
  //Invoked when generating the card DOM. Stacks.genBasicCardDOM functions as a basic reference implementation.
  genDOM: Stacks.genBasicCardDOM
  
};
