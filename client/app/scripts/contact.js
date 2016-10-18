/*globals  GOOGLE_MAPS_KEY */
'use strict';

angular.module('clientApp')

  .controller('ContactCtrl', ['$scope', '$rootScope', '$http', '$window', 'ModalService', '$sce',
    function($scope, $rootScope, $http, $window, ModalService, $sce) {
      var map;

      function _animateEnter(extraTime) {
        if (!$scope.animateEnter) {
          var time = $rootScope.firstEnter ? 500: 1000;
          time += extraTime <= 500 ? extraTime : 500;

          setTimeout(function() {
            $scope.animateEnter = true;
            $scope.visible = true;
            if (!$scope.$$phase) {
               $scope.$apply();
            }
            if (!$rootScope.firstEnter) {
              $rootScope.firstEnter = true;
            }
            setTimeout(function() {
              $scope.animateEnter = false;
              if (!$scope.$$phase) {
                $scope.$apply();
              }
            }, 1200);
          }, time);
        }
      }

      function _setupMap(data, cb) {
        $window.GoogleMapsLoader.KEY = GOOGLE_MAPS_KEY;
        $window.GoogleMapsLoader.load(function(google) {
          map = new google.maps.Map(document.getElementById('contact-map'), {
            center: {
              lat: data.lat,
              lng: data.lng
            },
            zoom: 11,
            maxZoom: 12,
            scrollwheel: false,
            options: {
              styles: [{'featureType':'all','elementType':'labels.text.fill','stylers':[{'color':'#000000'},{'lightness':'40'}]},{'featureType':'all','elementType':'labels.text.stroke','stylers':[{'visibility':'simplified'},{'color':'#000000'},{'lightness':16}]},{'featureType':'all','elementType':'labels.icon','stylers':[{'visibility':'off'}]},{'featureType':'administrative','elementType':'geometry.fill','stylers':[{'color':'#273239'},{'lightness':'52'},{'visibility':'off'}]},{'featureType':'administrative','elementType':'geometry.stroke','stylers':[{'weight':'1.00'},{'visibility':'on'},{'lightness':'-61'}]},{'featureType':'administrative.province','elementType':'labels.text','stylers':[{'visibility':'simplified'}]},{'featureType':'landscape','elementType':'geometry','stylers':[{'color':'#273239'},{'lightness':'-18'},{'saturation':'0'}]},{'featureType':'landscape.natural','elementType':'geometry.fill','stylers':[{'visibility':'on'}]},{'featureType':'poi','elementType':'geometry','stylers':[{'color':'#273239'},{'lightness':'-9'},{'visibility':'on'}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#111619'},{'lightness':'5'}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'weight':0.2},{'color':'#273239'},{'lightness':'-50'},{'visibility':'off'}]},{'featureType':'road.arterial','elementType':'geometry','stylers':[{'color':'#111619'},{'lightness':'6'}]},{'featureType':'road.arterial','elementType':'labels.text','stylers':[{'visibility':'off'}]},{'featureType':'road.local','elementType':'geometry','stylers':[{'color':'#111619'},{'lightness':'3'}]},{'featureType':'road.local','elementType':'labels.text','stylers':[{'visibility':'off'}]},{'featureType':'transit','elementType':'geometry','stylers':[{'color':'#273239'},{'lightness':'-9'}]},{'featureType':'water','elementType':'geometry','stylers':[{'color':'#182125'},{'lightness':'-12'},{'saturation':'0'},{'gamma':'1.00'}]},{'featureType':'water','elementType':'labels.text','stylers':[{'visibility':'simplified'}]}],
              disableDefaultUI: true
            }
          });

          //Auto center & scale the map based on the last 5 checkins...
          var bounds = new google.maps.LatLngBounds();
          //var last5Group = data.slice(0, 5);
          //for (var i=0; i< last5Group.length; i++) {
            //var checkin = last5Group[i];
            var latLng = new google.maps.LatLng({lat: data.lat, lng: data.lng});
            bounds.extend(latLng);
          //}
          map.fitBounds(bounds);

          var overlay = new google.maps.OverlayView();
          overlay.draw = function() {};
          overlay.onAdd = function() {
            if (!$scope.$$phase) {
              $scope.$apply();
            }

            if (cb) {
              cb();
            }
          };
          overlay.setMap(map);
        });
      }

      function _getUser(cb) {
        $http.get('/contact/user').success(function(data, status) {
          if (status === 200 && data) {
            //$scope.user = data;
            _setupMap(data, cb);
          }
        }).error(function(data) {
          console.log('Error', data);
          cb();
        });
      }

      _getUser(function() {
        //var start = new Date().getTime();
        var didLoadAnimateFirst = false;

        var loadTimeout = setTimeout(function() {
          if (!didLoadAnimateFirst) {
            didLoadAnimateFirst = true;
            _animateEnter(0);
          }
        }, 2000);
      });

      var status = document.getElementById('send-mail-status');
      $scope.send = function (form) {
        function clearForm() {
          document.getElementsByName("subject")[0].value = "";
          document.getElementsByName("name")[0].value = "";
          document.getElementsByName("email")[0].value = "";
          document.getElementsByName("body")[0].value = "";
        }
        $http
          .post('/contact/sendmail', {
            subject: form.subject.$viewValue,
            name: form.name.$viewValue,
            email: form.email.$viewValue,
            body: form.body.$viewValue
          })
          .success(function () {
            status.className += " success";
            status.innerHTML = "Success!!";
            clearForm();
          })
          .error(function () {
            status.className += " error";
            status.innerHTML = "Failed!!";
            clearForm();
          });
        };
    }
  ]);
