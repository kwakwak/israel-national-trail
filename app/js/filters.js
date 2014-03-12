'use strict';

/* Filters */

angular.module('myApp.filters', [])
   .filter('participants', function() {  // clean items without paticipants.
      return function(list, item) {
        var k = [];
        var out =[];
        var clean =[];
        for (k in list) {
          if (typeof(list[k]) === 'object') {
            if (item){
              if (list[k].participants.split(",").indexOf(item)!="-1") {
                list[k].part=false;
                out.push(list[k]);
              };
              if (list[k].partParticipants.split(",").indexOf(item)!="-1") {
                list[k].part=true;
                out.push(list[k]);
              }
            }else if (!item) {
              list[k].part=false;
              clean.push(list[k]);
            };
          };
        };
        if (item) {return out;} else {return clean;};
      };
   });