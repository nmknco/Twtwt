var app = angular.module('twtwt', []);

console.log('angular app loaded');

app.controller('mainController', ['$scope', '$http',
    function($scope, $http) {

        $scope.members = ['Pirates', 'penguins', 'Capitals'];

        $scope.lists = ['My First List1', 'second List', 'another!',
                'Last list1'];

        $scope.getMember = function(listIdStr) {
            $http({
                method: 'GET',
                url: '/list_members',
                params: { list_id: listIdStr}
            }).then(function sunccessCallback(response) {
                $scope.members = response.data;
            });
        }

        $scope.showListTL = function(index) {

            angular.element(document.getElementById('box1')).empty();

            var a = ['', '1', '2', '3'];

            twttr.widgets.createTimeline(
                {
                    sourceType: 'list',
                    ownerScreenName: 'nimeikun',
                    slug: 'list' + a[index]
                },
                document.getElementById('box1')
            );
        }

        $scope.showMemberTL = function(member, boxno) {

            var box = 'box' + boxno;

            angular.element(document.getElementById(box)).empty();

            twttr.widgets.createTimeline(
                {
                    sourceType: 'profile',
                    screenName: member
                },
                document.getElementById(box),
                {
                    height: 0,
                    // chrome: 'nofooter',
                    linkColor: '#2b7bb9',
                    'aria-polite': 'polite'
                }
            );
        }

    }
]);