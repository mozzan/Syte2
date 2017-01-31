/*jshint sub:true*/
'use strict';

angular.module('clientApp')

  .controller('BlogCtrl', ['$scope', '$rootScope', '$http', '$window', 'ModalService', '$sce',
    function($scope, $rootScope, $http, $window, ModalService, $sce) {
      $scope.posts = [];

      var streamElement = angular.element(document.getElementById('blog-page'))[0];
      var windowElement = angular.element($window)[0];
      var currentPage = 0;
      var running = false;
      var fetching = false;

      function handleScroll() {
        if (running) {
          return;
        }

        running = true;
        requestAnimationFrame(function() {
          if (windowElement.scrollY + windowElement.innerHeight > streamElement.clientHeight - 200) {
            currentPage++;
            running = true;
            _getPosts(function() {
              if (!$scope.$$phase) {
                $scope.$apply();
              }
            });
            return;
          }

          running = false;
        });
      }

      angular.element($window).bind('scroll', handleScroll);
      $scope.$on('$destroy', function() {
        angular.element($window).unbind('scroll', handleScroll);
      });

      var emptyResponses = 0;
      function _getPosts(cb) {
        if (fetching || emptyResponses > 2) {
          return;
        }

        fetching = true;
        $http.get('/blog/' + currentPage).success(function(data, status) {
          if (status === 200 && data && data.length) {

            for (var i=0; i < data.length; i++) {
              var post = data[i];
              if (post.player) {
                post.player = $sce.trustAsHtml(post.player);
              } else if (post['post_type'] === 'text') {
                post.body = $sce.trustAsHtml(post.body);
              }

              $scope.posts.push(post);
            }

            fetching = false;
            running = false;
            emptyResponses = 0;
            cb();
          } else {
            emptyResponses++;
            fetching = false;
            if (emptyResponses <= 2) {
              currentPage++;
              _getPosts(cb);
            }
          }
        }).error(function(data) {
          console.log('Error', data);
          fetching = false;
          running = false;
          cb();
        });
      }

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

      _getPosts(function() {
        _animateEnter(0);
      });

      $scope.openPost = function(item, index) {
          ModalService.showModal({
            templateUrl: 'templates/blog/details.html',
            controller: 'BlogDetailsCtrl',
            inputs: {
              item: item,
              idx: index
            }
          });
        };
    }
  ])

  .controller('BlogViewPostCtrl', ['$scope', '$rootScope', '$routeParams', '$http', 'ModalService', '$sce',
    function($scope, $rootScope, $routeParams, $http, ModalService, $sce) {
        $scope.posts = [];
        $scope.postNotFound = false;

        var fetching = false;
        function _getPost(cb) {
          if (fetching) {
            return;
          }

          fetching = true;
          $http.get('/blog/blogpost/' + $routeParams.postId).success(function(post, status) {
            if (status === 200 && post) {
              if (post.player) {
                post.player = $sce.trustAsHtml(post.player);
              } else if (post['post_type'] === 'text') {
                post.body = $sce.trustAsHtml(post.body);
              }

              $scope.posts = [post];
            } else {
              $scope.postNotFound = true;
            }
            fetching = false;
            cb();
          }).error(function(data) {
            console.log('Error', data);
            fetching = false;
            $scope.postNotFound = true;
            cb();
          });
        }


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

        _getPost(function() {
          _animateEnter(0);
        });

        $scope.openPost = function(item, index) {
            ModalService.showModal({
              templateUrl: 'templates/blog/details.html',
              controller: 'BlogDetailsCtrl',
              inputs: {
                item: item,
                idx: index
              }
            });
          };
    }
  ])

  .directive('blogPost', ['$sce', 'ModalService', function($sce, ModalService) {
    return {
      restrict: 'E',
      scope: {
        item: '='
      },
      templateUrl: 'templates/blog/post.html',
      link: function(scope) {
        if (scope.item.player) {
          scope.item.player = $sce.trustAsHtml(scope.item.player);
        }

        scope.openPost = function(item, index) {
          ModalService.showModal({
            templateUrl: 'templates/blog/details.html',
            controller: 'BlogDetailsCtrl',
            inputs: {
              item: item,
              idx: index
            }
          });
        };
      }
    };
  }])

  .controller('BlogDetailsCtrl', ['$scope', 'close', 'item', 'idx',
    function($scope, close, item, idx) {
      $scope.close = close;
      $scope.item = item;

      $scope.morePictures = false;
      $scope.picture = null;
      var pictureIndex = idx || 0;
      if (item.photos) {
        if (item.photos.length > 1) {
          $scope.morePictures = true;
          $scope.picture = item.photos[pictureIndex];
        } else {
          $scope.picture = item.photos[pictureIndex];
        }
      }

      $scope.nextPicture = function() {
        pictureIndex++;
        if (pictureIndex >= item.photos.length) {
          pictureIndex = 0;
        }
        $scope.picture = item.photos[pictureIndex];
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      };

      $scope.prevPicture = function() {
        pictureIndex--;
        if (pictureIndex < 0) {
          pictureIndex = item.photos.length -1;
        }
        $scope.picture = item.photos[pictureIndex];
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      };
    }
  ]);
