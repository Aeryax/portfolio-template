(function (angular) {


    var app = angular.module('taskApp', []);


    app.controller('TaskController', function ($scope, StorageService) {

        $scope.tasks = [];

        $scope.addTask = function (task) {

            $scope.tasks.push(task);
            $scope.$emit('task:added', 'task just added!');

            backupTaskList();
            refreshTasks();
        };

        $scope.removeTask = function (task) {

            var i = $scope.tasks.indexOf(task);
            $scope.tasks.splice(i, 1);
            $scope.$emit('task:removed');

            backupTaskList();
            refreshTasks();
        };

        function refreshTasks() {
            $scope.tasks = StorageService.getData('tasks');
        }

        function backupTaskList() {
            StorageService.save('tasks', $scope.tasks);
        }
    });

    app.service('StorageService', function ($http) {

        this.save = function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
            $http.post('/tasks', {key: value});
        };

        this.getData = function (key) {
            return JSON.parse(localStorage.getItem(key));
        };

        this.clear = function () {
            localStorage.clear();
        };
    });

    app.directive('nkAlert', function () {

        return {
            template: "<span>{{alert.msg}}</span>",
            replace: true,
            link: function (scope, elem, attrs) {

                scope.$on('task:added', function (data) {
                    attrs.$addClass(data.name.split(':').join('-'));
                    scope.alert = {msg: data.name};
                })
            }
        }
    });

}(angular));
