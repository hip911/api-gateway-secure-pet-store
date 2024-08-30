var app = angular.module('mainApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
      templateUrl: 'login.html'
  })
  .when('/pets', {
      resolve: {
        "check": function($location, $rootScope) {
          if(!$rootScope.loggedIn) {
            $location.path('/');
          }
        }
      },
      templateUrl: 'pets.html'
  })
  .otherwise({
    redirectTo: '/'
  });
});

app.controller('LoginController', function($scope, $location, $rootScope) {
  $scope.login = function() {
    var apigClient = apigClientFactory.newClient();
    apigClient.loginPost({}, { username: $scope.username, password: $scope.password })
    .then(function(result) {
      console.log("Got result: \n" + JSON.stringify(result));
      $rootScope.identityId = result.data.identityId;
      $rootScope.token = result.data.token;
      $rootScope.credentials = result.data.credentials;
      $rootScope.loggedIn = true;
      $location.path('/pets');
      $scope.$apply();
    }).catch(function(result){
      console.log(JSON.stringify(result));
      alert("Invalid login");
    });
  };

  $scope.register = function() {
    var apigClient = apigClientFactory.newClient();
    apigClient.usersPost({}, { username: $scope.username, password: $scope.password })
    .then(function(result) {
      console.log("Got result: \n" + JSON.stringify(result));
      $rootScope.identityId = result.data.identityId;
      $rootScope.token = result.data.token;
      $rootScope.credentials = result.data.credentials;
      $rootScope.loggedIn = true;
      $location.path('/pets');
      $scope.$apply();
    }).catch(function(result){
      console.log(JSON.stringify(result));
      alert("Invalid registration");
    });
  };
});


app.controller('PetsController', function($scope, $rootScope) {

  var apigClient = apigClientFactory.newClient({
    accessKey: $rootScope.credentials.accessKey,
    secretKey: $rootScope.credentials.secretKey,
    sessionToken: $rootScope.credentials.sessionToken,
    region: 'eu-west-1'
  });

  apigClient.petsGet({}, '')
  .then(function(result) {
    console.log("Got result: \n" + JSON.stringify(result));
    $scope.pets = result.data.pets;
    $scope.$apply();
    console.log("Pets are: \n" + JSON.stringify($scope.pets));
  }).catch(function(result){
    console.log(JSON.stringify(result));
    alert("Invalid request");
  });

  $scope.submit = function() {
    console.log("Submitting new pet hello:\n" + JSON.stringify($scope.pet));
    var apigClient = apigClientFactory.newClient({
      accessKey: $rootScope.credentials.accessKey,
      secretKey: $rootScope.credentials.secretKey,
      sessionToken: $rootScope.credentials.sessionToken,
      region: 'eu-west-1'
    });

    apigClient.petsPost({}, {
      petType: $scope.pet.petType,
      petName: $scope.pet.petName,
      petAge: $scope.pet.petAge
    })
    .then(function(result) {
      console.log("Got result: \n" + JSON.stringify(result));
      $scope.pet.petId = result.data.petId;
      console.log("Pet Id is: \n" + $scope.pet.petId);
      $scope.pets.push($scope.pet);
      $scope.pet = {};
      $scope.$apply();
    }).catch(function(result){
      console.log(JSON.stringify(result));
      alert("Invalid request");
    });
  };
});
