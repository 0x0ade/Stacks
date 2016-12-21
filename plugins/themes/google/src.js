/* global googleTheme */

/* TODO:
 * Logo dropdown (auto, color, white)
 * Background dropdown (auto, specific, none)
 */

googleTheme = Stacks.themes["core.theme.google"] = {
  id: "core.theme.google",
  name: "Google",
  
  hour: new Date().getHours(),
  times: Stacks.plugins["core.theme.google"].times,
  
  enable: function() {
    var time;
    for (var i = 0; i < googleTheme.times.length; i++) {
      time = googleTheme.times[i];
      if (googleTheme.hour < time.hour) {
        continue;
      }
      var end = 0;
      if (i == googleTheme.times.length-1) {
        end = 24;
      } else {
        end = googleTheme.times[i+1].hour;
      }
      if (googleTheme.hour < end) break;
      time = null;
    }
    if (time == null) {
      // googleTheme.hour < time.hour: it's before the earliest
      // ! googleTheme.hour < end: no end defined
      // must be before the earliest, so night
      time = googleTheme.times[googleTheme.times.length - 1];
    }
    $("#header-bg").addClass("gt-" + time.name);
    
    if (time.dark) {
      $("#header-logo").addClass("gt-white");
    }
  },
  
  disable: function() {
    for (var i = 0; i < googleTheme.times.length; i++) {
      $("#header-bg").removeClass("gt-" + googleTheme.times[i].name);
    }
    $("#header-logo").removeClass("gt-white");
  }
  
};
