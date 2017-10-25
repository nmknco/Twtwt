var app = angular.module('twtwt', []);

console.log('angular app loaded');

app.controller('mainController', ['$scope', '$http',
    function($scope, $http) {

        $scope.members = {};

        $scope.selected = 0;
        $scope.selectedLS = -1;

        $scope.range = function(n) {
            return new Array(n);
        };

        $scope.selectBox = function(i) {
            $scope.selected = i;
        };

        function selectNext() {
            $scope.selected += 1;
            $scope.selected %= 3;
        }
        
        $http({
            method: 'GET',
            url: '/lists'
        }).then(function successCallback(response) {
            // Angular: response.data (json) is return parsed
            $scope.lists = response.data;
        });

        $scope.getMember = function(listIdStr, i) {
            $http({
                method: 'GET',
                url: '/list_members',
                params: { 
                    list_id: listIdStr,
                    count: 100
                }
            }).then(function sunccessCallback(response) {
                $scope.members = response.data;
            });
            $scope.selectedLS = i;
        }

        function showTL(query, boxId, autoSelect, title) {
            // Use local copies, so that they won't be changed
            //      by other calls of the function
            // Immediately select next to get ready for the next call
            var activeBox = document.getElementById('box' + boxId)
            var activeBox_jq = angular.element(activeBox);
            var activeTitle_jq = angular.element(
                document.getElementById('title' + boxId));
            
            if (autoSelect) selectNext();

            activeTitle_jq.html(title);
            activeBox_jq.empty().html(
                '<div class="loaderbox"><div class="loader"></div></div>');

            // Note: createTimeline method IS ASYNCHRONIC 
            //      and returns a promise
            twttr.widgets.createTimeline(
                query,
                activeBox,
                {
                    height: 0,
                    chrome: 'noheader nofooter'
                }
            ).then(function() 
                {
                    activeBox_jq.find('div').remove();
                    // $scope.$apply(); // may need this if model is changed
                }
            );
        }

        $scope.showListTL = function(ownerName, slug, listname) {
            var query = {
                sourceType: 'list',
                ownerScreenName: ownerName,
                slug: slug
            };
            var title = listname + '(list of @' + ownerName + ')';
            showTL(query, $scope.selected, true, title);
        }

        $scope.showMemberTL = function(username, nickname) {

            var query = {
                    sourceType: 'profile',
                    screenName: username
            };
            var pre_fun = function(){};
            var title = nickname + '(@' + username + ')';
            showTL(query, $scope.selected, true, title);
        }


    }
]);