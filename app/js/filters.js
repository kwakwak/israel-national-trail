'use strict';

/* Filters */

angular.module('myApp.filters', [])
   .filter('clean', function() {  // clean items without paticipants.
      return function(list) {
        var k, out = [];
        for (k in list) if (list[k].participants) out.push(list[k]);
        return out;
      };


   });
