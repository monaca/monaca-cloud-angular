/**
 * AngularJS Module for Monaca Backend
 *
 * @author   NAKAGAWA Yoshiki  <info@asial.co.jp>
 * @license  http://www.apache.org/licenses/LICENSE-2.0
 */
(function() {
    'use strict';

    var cloud = monaca.cloud;
    var module = angular.module('monaca.cloud', []);

    module.factory('mcUtil', ['$q', function($q) {
        var mcUtil = {};

        mcUtil.promise = function(promise) {
            var deferred = $q.defer();
            promise.then(deferred.resolve, deferred.reject);
            return deferred.promise;
        };

        return mcUtil;
    }]);

    module.factory('mcPush', function() {
        var mcPush = {
            setHandler: function(callback) {
                cloud.Push.setHandler(callback);
            }
        };

        return mcPush;
    });

    module.factory('mcUser', ['mcUtil', function(mcUtil) {
        var User = cloud.User;
        var promise = mcUtil.promise;

        var mcUser = {
            getOid: function() {
                return User._oid;
            },
            register: function() {
                return promise(User.register.apply(User, arguments));
            },
            validate: function() {
                return promise(User.validate.apply(User, arguments));
            },
            unregister: function() {
                return promise(User.unregister.apply(User, arguments));
            },
            login: function() {
                return promise(User.login.apply(User, arguments));
            },
            isAuthenticated: function() {
                return User.isAuthenticated();
            },
            autoLogin: function() {
                return promise(User.autoLogin.apply(User, arguments));
            },
            logout: function() {
                return promise(User.logout.apply(User, arguments));
            },
            updatePassword: function() {
                return promise(User.updatePassword.apply(User, arguments));
            },
            sendPasswordResetToken: function() {
                return promise(User.sendPasswordResetToken.apply(User, arguments));
            },
            resetPasswordAndLogin: function() {
                return promise(User.resetPasswordAndLogin.apply(User, arguments));
            },
            getProperty: function() {
                return promise(User.getProperty.apply(User, arguments));
            },
            getProperties: function() {
                return promise(User.getProperties.apply(User, arguments));
            },
            saveProperty: function() {
                return promise(User.saveProperty.apply(User, arguments));
            },
            saveProperties: function() {
                return promise(User.saveProperties.apply(User, arguments));
            }
        };

        return mcUser;
    }]);

    module.factory('mcCollectionItem', ['mcUtil', function(mcUtil) {
        var promise = mcUtil.promise;

        var mcCollectionItem = {
            update: function(item) {
                return promise(item.update());
            },
            getPermission: function(item) {
                return promise(item.getPermission());
            },
            updatePermission: function(item, permission) {
                return promise(item.updatePermission(permission));
            },
            delete: function(item) {
                return promise(item.delete());
            }
        };

        return mcCollectionItem;
    }]);

    module.factory('mcCollection', ['mcUtil', function(mcUtil) {
        var promise = mcUtil.promise;

        var MonacaCloudCollection = function(colName) {
            this._collection = cloud.Collection(colName);
        };

        MonacaCloudCollection.prototype = {
            find: function() {
                return promise(this._collection.find.apply(this._collection, arguments));
            },
            findMine: function() {
                return promise(this._collection.findMine.apply(this._collection, arguments));
            },
            findOne: function() {
                return promise(this._collection.findOne.apply(this._collection, arguments));
            },
            findOneMine: function() {
                return promise(this._collection.findOneMine.apply(this._collection, arguments));
            },
            insert: function() {
                return promise(this._collection.insert.apply(this._collection, arguments));
            },
            updatePermission: function() {
                return promise(this._collection.updatePermission.apply(this._collection, arguments));
            }
        };

        return function(name) {
            return new MonacaCloudCollection(name);
        };
    }]);

    module.factory('mcCriteria', function() {
        return monaca.cloud.Criteria;
    });

    module.factory('mcDevice', ['mcUtil', function(mcUtil) {
        var promise = mcUtil.promise;
        var Device = cloud.Device;

        var mcDevice = {
            getProperty: function() {
                return promise(Device.getProperty.apply(Device, arguments));
            },
            getProperties: function() {
                return promise(Device.getProperties.apply(Device, arguments));
            },
            saveProperty: function() {
                return promise(Device.saveProperty.apply(Device, arguments));
            },
            saveProperties: function() {
                return promise(Device.saveProperties.apply(Device, arguments));
            }
        };

        return mcDevice;
    }]);

    module.factory('mcMailer', ['mcUtil', function(mcUtil) {
        var promise = mcUtil.promise;
        var Mailer = cloud.Mailer;

        var mcMailer = {
            sendMail: function() {
                return promise(Mailer.sendMail.apply(Mailer, arguments));
            }
        };

        return mcMailer;
    }]);

    module.factory('MonacaBackend', ['$injector', function($injector) {
        var MonacaBackend = {
            Push: $injector.get('mcPush'),
            User: $injector.get('mcUser'),
            Collection: $injector.get('mcCollection'),
            CollectionItem: $injector.get('mcCollectionItem'),
            Criteria: $injector.get('mcCriteria'),
            Device: $injector.get('mcDevice'),
            Mailer: $injector.get('mcMailer'),
            Util: $injector.get('mcUtil'),
        };

        return MonacaBackend;
    }]);
})();
