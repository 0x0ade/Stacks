/* global googleTheme */

googleTheme = Stacks.themes["core.theme.google"] = {
  id: "core.theme.google",
  name: "Google",
  
  hour: new Date().getHours(),
  times: Stacks.plugins["core.theme.google"].times,
  
  enable: function() {
    for (var i = 0; i < googleTheme.times.length; i++) {
      var time = googleTheme.times[i];
      if (googleTheme.hour < time.hour) {
        continue;
      }
      var end = 0;
      if (i == googleTheme.times.length-1) {
        end = 24;
      } else {
        end = googleTheme.times[i+1].hour;
      }
      if (googleTheme.hour < end) {
        $("#header-bg").addClass("gt-" + time.name);
        break;
      }
    }
    
    if (time.dark) {
      $("#header-logo").addClass("white");
    }
  },
  
  disable: function() {
    for (var i = 0; i < googleTheme.times.length; i++) {
      $("#header-bg").removeClass("gt-" + googleTheme.times[i].name);
    }
    $("#header-logo").removeClass("white");
  }
  
};
