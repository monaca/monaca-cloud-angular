# monaca-cloud-angular

Monaca Backend API ( http://docs.monaca.mobi/en/reference/javascript/cloud/ ) for AngularJS


## Example

index.html

    <!DOCTYPE html>
    <html lang="en" ng-app="app">
    <head>
        <meta charset="UTF-8">
        <title>Example</title>
        <script src="plugins/plugin-loader.js"></script>
        
        <script src="path/to/angular.js"></script>
        <script src="path/to/monaca-cloud-angular.js"></script>
        <script src="path/to/main.js"></script>
    </head>
    <body ng-controller="MainCtrl">
    
    <pre>
    {{result|json}}
    --------------------------
    {{error|json}}
    </pre>
    
    </body>
    </html>

main.js

    var app = angular.module('app', ['monaca.cloud']);

    app.controller('MainCtrl', function($scope, MonacaBackend) {

        MonacaBackend.User.register('myuser', 'mypass', {'age': 18}).then(
            function(result) {
                console.log(result);
                $scope.result = result;
            },
            function(error) {
                console.log(error);
                $scope.error = error;
            }
        );

    });

## APIs

See http://docs.monaca.mobi/en/reference/javascript/cloud/

Api Diffs

    monaca.cloud.User._oid => MonacaBackend.User.getOid()
    item.update() => MonacaBackend.CollectionItem.update(item)
    item.getPermission() => MonacaBackend.CollectionItem.getPermission(item)
    item.updatePermission(permission) => MonacaBackend.CollectionItem.updatePermission(item, permission)
    item.delete() => MonacaBackend.CollectionItem.delete(item)

## Test

* Create Monaca Account
* Create Monaca Backend and 'diary' collection on Monaca IDE
* cp test/configs/debug.sample.js test/configs/debug.js
* Edit test/configs/debug.js ( check values on monaca debugger)
* npm install -g karma
* karma start

