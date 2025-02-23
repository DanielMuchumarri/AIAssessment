// client/app.js

var myApp = angular.module("myApp", []);

myApp.controller("MainController", function ($scope, $http) {
  $scope.message = "Hello from AngularJS!";

  $scope.serverData = {};

  $scope.getServerData = function () {
    // Example: calls the /api/users endpoint on your Node.js server
    $http
      .get("http://localhost:3000/api/users")
      .then(function (response) {
        $scope.serverData = response.data;
      })
      .catch(function (error) {
        console.error("Error fetching data:", error);
      });
  };
});
