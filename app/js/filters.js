'use strict';

/* Filters */

angular.module('myApp.filters', [])
   .filter('participants', function() {  // clean items without paticipants.
      return function(list, item) {
        var k, out = [];
        for (k in list) if (list[k].participants.split(",").indexOf(item)!="-1") out.push(list[k]);
        if(item){return out;} else {return list;}
      };
   })
   .filter('clean', function() {  // clean items without paticipants.
      return function(list) {
        var k, out = [];
        for (k in list) if (typeof(list[k]) === 'object') out.push(list[k]);
        return out;
      };
   });
