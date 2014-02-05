// main
var app = angular.module('app', ['monaca.cloud']);

app.controller('MainCtrl', function($scope, MonacaBackend) {
    'use strict';

    $scope.result = 'null';
    $scope.error = 'null';

    var mypass = 'pass';

    $scope.register = function() {
        var now = Date.now();
        MonacaBackend.User.register('user' + now, mypass, {'cc': 'dd'}).then(
            function(result) {
                console.log(result);
                $scope.result = result;
            },
            function(err) {
                console.log(err);
                $scope.error = err;
            }
        );
    };

    $scope.registerAndUnregister = function() {
        var now = Date.now();
        MonacaBackend.User.register('user' + now, mypass, {'cc': 'dd'}).then(
            function(res) {
                console.log(res);
                $scope.result = res;
                return res;
            },
            function(err) {
                console.log(err);
                $scope.error = err;
            }
        ).then(function(res) {
            console.log(res);
            MonacaBackend.User.unregister(mypass).then(
                function(res) {
                    console.log(res);
                    $scope.result = res;
                },
                function(err) {
                    console.log(err);
                    $scope.error = err;
                }
            );
        });
    };

    $scope.testCollection = function() {
        var now = Date.now();
        var Diary = MonacaBackend.Collection('diary');
        Diary.insert({title: 'Any title' + now, body: 'Hello world' + now}).then(
            function(res) {
                console.log(res);
                var criteria = MonacaBackend.Criteria('title == ?', ['Any title' + now]);
                //var criteria = null;
                return Diary.findOne(criteria, '_createdAt DESC');
            },
            function(err) {
                console.log(err);
                $scope.error = err;
            }
        ).then(
            function(item) {
                console.log(item.title, item);
                item.title = new Date();
                return MonacaBackend.CollectionItem.update(item);
            },
            function(err) {
                console.log(err);
                $scope.error = err;
            }
        ).then(
            function(res) {
                console.log(res);
                $scope.result = res;
            },
            function(err) {
                console.log(err);
                $scope.error = err;
            }
        );
    };

    $scope.deviceProperty = function() {
        var now = Date.now();
        MonacaBackend.Device.saveProperty('nickname', 'nick' + now).then(
            function(result) {
                console.log(result);
                return result;
                //$scope.result = result;
            },
            function(err) {
                console.log(err);
                $scope.error = err;
            }
        ).then(function() {
            MonacaBackend.Device.getProperty('nickname').then(
                function(result) {
                    console.log(result);
                    $scope.result = result;
                },
                function(err) {
                    console.log(err);
                    $scope.error = err;
                }
            );
        });
    };

    $scope.sendMail = function() {
        var now = Date.now();
        MonacaBackend.Mailer.sendMail('uc58e8a5e-5152-4778-9eb3-0610070dd449', 'template_a', {'now': now}).then(
            function(result) {
                console.log(result);
                $scope.result = result;
            },
            function(err) {
                console.log(err);
                $scope.error = err;
            }
        );
    };
});
