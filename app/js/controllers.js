'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
   .controller('HomeCtrl', ['$scope', 'syncData','$routeParams','$log','$location', function($scope, syncData,$routeParams,$log,$location) {

        $scope.sections = syncData('israel-national-trail');
        
        $scope.sections.$on("loaded", function() {
          $scope.loaded=true;

          var participants ={};
          angular.forEach($scope.sections, function(list){
            if (list.participants) 
              angular.forEach(list.participants.split(","), function(part){
                if (!participants[part]) participants[part]={length:0,lengthPercent:0}; 
                participants[part].length += parseFloat(list.length);
                participants[part].lengthPercent +=  parseFloat(list.lengthPercent);

              });
          });
          $scope.participantsObj = participants;
          var participantsArr =[];
          angular.forEach(participants, function(value, key){
                var  partObj = {
                  "name" : key,
                  "length" : value.length,
                  "lengthPercent" : value.lengthPercent.toFixed(0)
                }
                 this.push(partObj);
               }, participantsArr);
          $scope.participants =participantsArr;

        });

        
        $scope.$watch('search', function(newVal, oldVal, scope) {
            
            if (newVal !== oldVal) {
              $scope.stat={};
              if (newVal) $scope.stat={"search": true};
              else   scope.stat={"search": false};
              if ($scope.participantsObj[newVal]){
                $scope.stat=
                {
                  length:$scope.participantsObj[newVal].length,
                  lengthPercent:$scope.participantsObj[newVal].lengthPercent.toFixed(0),
                  show:true
                };
              }else $scope.stat.show=false;
            };         
      
        });
 
   }])
  .controller('ChatCtrl', ['$scope', 'syncData', function($scope, syncData) {
      $scope.newMessage = null;

      // constrain number of messages by limit into syncData
      // add the array into $scope.messages
      $scope.messages = syncData('messages', 10);

      // add new messages to the list
      $scope.addMessage = function() {
         if( $scope.newMessage ) {
            $scope.messages.$add({text: $scope.newMessage});
            $scope.newMessage = null;
         }
      };
   }])

    .controller('admin', ['$scope', 'syncData','$log', function($scope, syncData,$log) {

        syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');

        $scope.resetEvent = function(){
            $scope.event = {
                title: null,
                details: null,
                date :null,
                place: null,
                type_selected: null,
                types: ['Show','Movie']
            };

            $scope.showSave = 0;
        };
        $scope.resetEvent();
        $scope.eventsOnServer = syncData('events');

        // add new messages to the list
        $scope.addEvent = function() {
            if( $scope.event.title ) {
                $scope.eventsOnServer.$child($scope.event.date).$add($scope.event);
                $scope.resetEvent();
            }
        };
        $scope.editEvent =function(id,action,date){
          $scope.selectedEvent = syncData('events/'+date+'/'+id);
            if (action =='del'){
                $scope.selectedEvent.$remove();
            } else if (action =='edit'){
                $scope.event= $scope.selectedEvent;
                $scope.showSave = 1;
            }
        };
        $scope.save = function(){
            $scope.event.$save();
            $scope.resetEvent();
        };
    }])


   .controller('LoginCtrl', ['$scope', 'loginService', '$location', function($scope, loginService, $location) {
      $scope.email = null;
      $scope.pass = null;
      $scope.confirm = null;
      $scope.createMode = false;


      $scope.login = function(cb) {
         $scope.err = null;
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
         }
         else {
            loginService.login($scope.email, $scope.pass, function(err, user) {
               $scope.err = err? err + '' : null;
               if( !err ) {
                  cb && cb(user);
               }
            });
         }
      };

      $scope.createAccount = function() {
         $scope.err = null;
         if( assertValidLoginAttempt() ) {
            loginService.createAccount($scope.email, $scope.pass, function(err, user) {
               if( err ) {
                  $scope.err = err? err + '' : null;
               }
               else {
                  // must be logged in before I can write to my profile
                  $scope.login(function() {
                     loginService.createProfile(user.uid, user.email);
                     $location.path('/account');
                  });
               }
            });
         }
      };

      function assertValidLoginAttempt() {
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
         }
         else if( $scope.pass !== $scope.confirm ) {
            $scope.err = 'Passwords do not match';
         }
         return !$scope.err;
      }
   }])

   .controller('AccountCtrl', ['$scope', 'loginService', 'syncData', '$location', function($scope, loginService, syncData, $location) {
      syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');

      $scope.logout = function() {
         loginService.logout();
      };

      $scope.oldpass = null;
      $scope.newpass = null;
      $scope.confirm = null;

      $scope.reset = function() {
         $scope.err = null;
         $scope.msg = null;
      };

      $scope.updatePassword = function() {
         $scope.reset();
         loginService.changePassword(buildPwdParms());
      };

      function buildPwdParms() {
         return {
            email: $scope.auth.user.email,
            oldpass: $scope.oldpass,
            newpass: $scope.newpass,
            confirm: $scope.confirm,
            callback: function(err) {
               if( err ) {
                  $scope.err = err;
               }
               else {
                  $scope.oldpass = null;
                  $scope.newpass = null;
                  $scope.confirm = null;
                  $scope.msg = 'Password updated!';
               }
            }
         }
      }

   }]);