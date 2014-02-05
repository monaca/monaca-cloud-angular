/*
 * cloud
 */
(function(root) {

    var monaca = root.monaca = root.monaca || {};
    monaca.cloud = monaca.cloud || {};

    monaca.cloud.timeout = 30000;
    monaca.cloud.url = '%%%CLOUD_HOST%%%';
    monaca.cloud.backendId = '%%%BACKEND_ID%%%';
    monaca.cloud.apiKey = '%%%BACKEND_API_KEY%%%';
    monaca.cloud.deviceId = null;
    monaca.cloud.postQueue = [];

    /**
     * @property {jQuery} .
     */
    monaca.cloud.$ = root.$;
    if (typeof root.$ === 'undefined') {
        console.error('$ is not defined!');
    }

    var MonacaCloudError = (function() {
        function MonacaCloudError(code, message, data) {
            if (typeof data === "undefined") {
                data = {};
            }
            this.code = code;
            this.message = message;
            this.data = data;
        }
        return MonacaCloudError;
    })();

    /**
     * @class
     */
    monaca.cloud.Error = function(code, message, data) {
        return new MonacaCloudError(code, message, data);
    };

    /**
     * @param {Number} msec .
     */
    monaca.cloud.setTimeout = function(msec) {
        this.timeout = msec;
    };

    // Get device id
    document.addEventListener("DOMContentLoaded", function() {
        document.addEventListener("deviceready", function() {

            cordova.exec(function(result) {
                monaca.cloud.deviceId = new String(result.deviceId);
                // execute and clear postQueue
                for (var i = 0; i < monaca.cloud.postQueue.length; i++) {
                    monaca.cloud._doPost.apply(monaca.cloud, monaca.cloud.postQueue[i]);
                }
                monaca.cloud.postQueue = [];
            }, function(error) {
                console.error(error);
            },

            "Monaca",
            "getRuntimeConfiguration", []
        );
    }, false);
}, false);

// Others
monaca.cloud._post = function(method, params, dfd, ajaxOptions, beforeSuccess) {
    if (monaca.cloud.deviceId == null) {
        monaca.cloud.postQueue.push([method, params, dfd, ajaxOptions, beforeSuccess]);
    } else {
        monaca.cloud._doPost(method, params, dfd, ajaxOptions, beforeSuccess);
    }
};

monaca.cloud._doPost = function(method, params, dfd, ajaxOptions, beforeSuccess) {
    var $ = monaca.cloud.$;

    if (typeof(ajaxOptions) === 'undefined') ajaxOptions = {};
    if ((typeof(method) === 'undefined') && (typeof(params) === 'undefined')) {
        throw new Error('Invalid arguments');
    }

    params['__api_key'] = monaca.cloud.apiKey;
    params['__device'] = monaca.cloud.deviceId;
    var sid = monaca.cloud._getSessionId();
    if (sid.length > 0) {
        params['__session'] = sid;
    }
    var data = JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: '1'
    });

    var o = $.extend(true, {
        url: this.url + this.backendId,
        data: data,
        dataType: 'json',
        type: 'POST',
        timeout: this.timeout,
        success: function(jsonResponse, status, xhr) {
            var sessionHeader = xhr.getResponseHeader('X-Set-Monaca-Cloud-Session');
            if (sessionHeader) {
                monaca.cloud._setSessionId(sessionHeader);
            }

            if (typeof(jsonResponse.error) !== 'undefined') {
                // has error code
                dfd.reject(jsonResponse.error);
            } else {
                // success
                if (typeof(jsonResponse.result.loginToken) !== 'undefined') {
                    localStorage.monacaCloudLoginToken = jsonResponse.result.loginToken;
                }
                if (typeof(beforeSuccess) !== 'undefined') {
                    beforeSuccess(jsonResponse, status, xhr, dfd);
                }
                dfd.resolve(jsonResponse.result);
            }
        },
        error: function(xhr, status) {
            switch (status) {
                case 'timeout':
                var err = monaca.cloud.Error(-11, 'Connection timeout');
                break;
                case 'parsererror':
                var err = monaca.cloud.Error(-12, 'Invalid response');
                break;
                default:
                var err = monaca.cloud.Error(-13, 'Invalid status code');
            }
            dfd.reject(err);
        }
    }, ajaxOptions);

    $.ajax(o);
};

monaca.cloud._getSessionId = function() {
    if (typeof(document.cookie) != 'undefined' && document.cookie.match(/monaca_cloud_session=([a-zA-Z0-9]+)/)) {
        return RegExp.$1;
    } else {
        return '';
    }
};

monaca.cloud._setSessionId = function(id) {
    if (typeof id != 'string') {
        id = '';
    }
    document.cookie = 'monaca_cloud_session=' + id;
};

})(this);
/*
 * CollectionItem
 */
(function(root) {

    var monaca = root.monaca = root.monaca || {};
    monaca.cloud = monaca.cloud || {};
    var $ = monaca.cloud.$;

    /**
     * @class
     */
    MonacaCloudCollectionItem = (function() {

        function MonacaCloudCollectionItem(item, collection) {

            /**
             * @property {String} .
             */
            this._id = item._id;

            /**
             * @property {String} .
             */
            this._ownerUserOid = item._ownerUserOid;

            /**
             * @property {Date} .
             */
            this._createdAt = new Date(item._createdAt);

            /**
             * @property {Date} .
             */
            this._updatedAt = new Date(item._updatedAt);

            /**
             * @property {MonacaCloudCollection} .
             */
            this._collection = collection;


            for (var key in item) {
                if (key.substr(0, 1) != '_') {
                    this[key] = item[key];
                }
            }
        }

        MonacaCloudCollectionItem.prototype = {

            /**
             * @return {$.Promise} .
             */
            update: function() {
                var dfd = new $.Deferred();
                var col = this._collection;
                var data = {};

                for (var key in this) {
                    if (key.indexOf('_') !== 0) {
                        data[key] = this[key];
                    }
                }

                monaca.cloud._post('Collection.update', {
                    collectionName: col.name,
                    itemOid: this._id,
                    data: data,
                }, dfd, {});

                    return dfd.promise();
                },

                /**
                 * @return {$.Promise} .
                 */
                getPermission: function() {
                    var dfd = new $.Deferred();
                    var col = this._collection;

                    monaca.cloud._post('Collection.getPermission', {
                        collectionName: col.name,
                        itemOid: this._id
                    }, dfd, {});

                    return dfd.promise();
                },

                /**
                 * @param {Object} permission .
                 * @param {Object} [options] .
                 * @return {$.Promise} .
                 */
                updatePermission: function(permission, options) {
                    var dfd = new $.Deferred();
                    var col = this._collection;

                    if (typeof(options) === 'undefined') {
                        options = {};
                    }

                    monaca.cloud._post('Collection.updatePermission', {
                        collectionName: col.name,
                        criteria: '_id == ?',
                        bindParams: [this._id],
                        permission: permission,
                        options: options
                    }, dfd, {});

                    return dfd.promise();
                },

                /**
                 * @return {$.Promise} .
                 */
                'delete': function() {
                    var dfd = new $.Deferred();
                    var col = this._collection;

                    monaca.cloud._post('Collection.delete', {
                        collectionName: col.name,
                        itemOid: this._id,
                    }, dfd, {});

                        return dfd.promise();
                    }

                };


                return MonacaCloudCollectionItem;
            })();

            monaca.cloud.CollectionItem = function(item, collection) {
                return new MonacaCloudCollectionItem(item, collection);
            };

        })(this);
        /*
         * Collection
         */
        (function(root) {

            var monaca = root.monaca = root.monaca || {};
            monaca.cloud = monaca.cloud || {};
            var $ = monaca.cloud.$;

            /**
             * @class
             */
            MonacaCloudCollection = (function() {

                function MonacaCloudCollection(name) {
                    this.name = name;
                }

                MonacaCloudCollection.prototype = {

                    /**
                     * @param {Object|Array} items .
                     * @return {Array} result .
                     */
                    _makeCollectionItem: function(items) {
                        var result = [];

                        if (items instanceof Array) {
                            for (var i = 0; i < items.length; i++) {
                                result[i] = monaca.cloud.CollectionItem(items[i], this);
                            }
                        } else {
                            result = monaca.cloud.CollectionItem(items, this);
                        }

                        return result;
                    },

                    /**
                     * @param {Criteria|Array} criteria .
                     */
                    _validateCriteria: function(criteria) {
                        if ((typeof(criteria) === 'undefined') || (typeof(criteria) === 'null')) {
                            criteria = monaca.cloud.Criteria('');
                        } else if (typeof(criteria) === 'string') {
                            criteria = monaca.cloud.Criteria(criteria);
                        }

                        return criteria;
                    },

                    /**
                     * @param {Object|Array} orderBy .
                     * @param {Object} options .
                     */
                    _validateOptions: function(orderBy, options) {
                        //if orderBy is hash, consider it as "options"
                        if ((typeof(orderBy) === 'object') && (typeof(orderBy.length) === 'undefined')) {
                            options = orderBy;
                            if (typeof(options.orderBy) !== 'undefined') {
                                orderBy = orderBy.orderBy;
                            } else {
                                orderBy = null;
                            }
                        }

                        if (orderBy === '') {
                            orderBy = null;
                        }

                        return {
                            orderBy: orderBy,
                            options: options
                        };
                    },

                    /**
                     * @param {Criteria|String} criteria .
                     * @param {String|Array} [orderBy] .
                     * @param {Object} [options] .
                     * @return {$.Promise} .
                     */
                    find: function(criteria, orderBy, options) {
                        var self = this;
                        var dfd = new $.Deferred();

                        criteria = self._validateCriteria(criteria);
                        var o = self._validateOptions(orderBy, options);

                        monaca.cloud._post('Collection.find', {
                            collectionName: this.name,
                            criteria: criteria.query,
                            bindParams: criteria.bindParams,
                            orderBy: o.orderBy,
                            options: o.options
                        }, dfd, {},
                        function(e, status, xhr, dfd) {
                            e.result.items = self._makeCollectionItem(e.result.items);
                            dfd.resolve(e.result);
                        });

                        return dfd.promise();
                    },

                    /**
                     * @param {Criteria|String} criteria .
                     * @param {String|Array} [orderBy] .
                     * @param {Object} [options] .
                     * @return {$.Promise} .
                     */
                    findMine: function(criteria, orderBy, options) {
                        var self = this;
                        var dfd = new $.Deferred();

                        criteria = self._validateCriteria(criteria);
                        var o = self._validateOptions(orderBy, options);

                        var userOid = monaca.cloud.User._oid;

                        if (criteria.query != '') {
                            criteria.query = '(' + criteria.query + ') && ';
                        }
                        if (userOid != null) {
                            criteria.query += '(_ownerUserOid == ?)';
                            criteria.bindParams.push(userOid);
                        } else {
                            criteria.query += '(_ownerDeviceOid == ?)';
                            criteria.bindParams.push(monaca.cloud.deviceId);
                        }

                        monaca.cloud._post('Collection.find', {
                            collectionName: this.name,
                            criteria: criteria.query,
                            bindParams: criteria.bindParams,
                            orderBy: o.orderBy,
                            options: o.options
                        }, dfd, {},
                        function(e, status, xhr, dfd) {
                            e.result.items = self._makeCollectionItem(e.result.items);
                            dfd.resolve(e.result);
                        });

                        return dfd.promise();
                    },

                    /**
                     * @param {Criteria|String} criteria .
                     * @param {String|Array} [orderBy] .
                     * @param {Object} [options] .
                     * @return {$.Promise} .
                     */
                    findOne: function(criteria, orderBy, options) {
                        var self = this;
                        var dfd = new $.Deferred();

                        criteria = self._validateCriteria(criteria);
                        var o = self._validateOptions(orderBy, options);

                        monaca.cloud._post('Collection.find', {
                            collectionName: this.name,
                            criteria: criteria.query,
                            bindParams: criteria.bindParams,
                            orderBy: o.orderBy,
                            options: o.options
                        }, dfd, {},
                        function(e, status, xhr, dfd) {
                            var result = (e.result.totalItems > 0) ? self._makeCollectionItem(e.result.items[0]) : null;
                            dfd.resolve(result);
                        });

                        return dfd.promise();
                    },

                    /**
                     * @param {Criteria|String} criteria .
                     * @param {String|Array} [orderBy] .
                     * @param {Object} [options] .
                     * @return {$.Promise} .
                     */
                    findOneMine: function(criteria, orderBy, options) {
                        var self = this;
                        var dfd = new $.Deferred();

                        criteria = self._validateCriteria(criteria);
                        var o = self._validateOptions(orderBy, options);

                        var userOid = monaca.cloud.User._oid;

                        if (criteria.query != '') {
                            criteria.query = '(' + criteria.query + ') && ';
                        }
                        if (userOid != null) {
                            criteria.query += '(_ownerUserOid == ?)';
                            criteria.bindParams.push(userOid);
                        } else {
                            criteria.query += '(_ownerDeviceOid == ?)';
                            criteria.bindParams.push(monaca.cloud.deviceId);
                        }

                        monaca.cloud._post('Collection.find', {
                            collectionName: this.name,
                            criteria: criteria.query,
                            bindParams: criteria.bindParams,
                            orderBy: o.orderBy,
                            options: o.options
                        }, dfd, {},
                        function(e, status, xhr, dfd) {
                            var result = (e.result.totalItems > 0) ? self._makeCollectionItem(e.result.items[0]) : null;
                            dfd.resolve(result);
                        });

                        return dfd.promise();
                    },

                    /**
                     * @param {Object} item .
                     * @param {Object} [permission] .
                     * @return {$.Promise} .
                     */
                    insert: function(item, permission) {
                        var self = this;
                        var dfd = new $.Deferred();

                        if (typeof(permission) === 'undefined') {
                            permission = {};
                        }

                        monaca.cloud._post('Collection.insert', {
                            collectionName: this.name,
                            item: item,
                            permission: permission
                        }, dfd, {},
                        function(e, status, xhr, dfd) {
                            var item = self._makeCollectionItem(e.result.item);
                            dfd.resolve(item);
                        });

                        return dfd.promise();
                    },

                    /**
                     * @param {Criteria|String} criteria .
                     * @param {Object} permission .
                     * @param {Object} [options] .
                     * @return {$.Promise} .
                     */
                    updatePermission: function(criteria, permission, options) {
                        var self = this;
                        var dfd = new $.Deferred();

                        criteria = self._validateCriteria(criteria);

                        monaca.cloud._post('Collection.updatePermission', {
                            collectionName: this.name,
                            criteria: criteria.query,
                            bindParams: criteria.bindParams,
                            permission: permission,
                            options: options
                        }, dfd, {});

                        return dfd.promise();
                    }
                };

                return MonacaCloudCollection;
            })();


            monaca.cloud.Collection = function(name) {
                return new MonacaCloudCollection(name);
            };

        })(this);
        /*
         * Criteria
         */
        (function(root) {

            var monaca = root.monaca = root.monaca || {};
            monaca.cloud = monaca.cloud || {};
            var $ = monaca.cloud.$;

            /**
             * @class
             */
            MonacaCloudCriteria = (function() {

                function MonacaCloudCriteria(query, bindParams) {
                    this.query = query;
                    this.bindParams = (typeof(bindParams) !== 'undefined') ? bindParams : [];
                }

                return MonacaCloudCriteria;
            })();


            monaca.cloud.Criteria = function(query, bindParams) {
                return new MonacaCloudCriteria(query, bindParams);
            };

        })(this);
        /*
         * Device
         */
        (function(root) {

            var monaca = root.monaca = root.monaca || {};
            monaca.cloud = monaca.cloud || {};
            var $ = monaca.cloud.$;

            /**
             * @class
             */
            monaca.cloud.Device = {

                /**
                 * @param {String} name .
                 * @return {$.Promise} .
                 */
                getProperty: function(name) {
                    var dfd = new $.Deferred();

                    monaca.cloud._post('Device.getProperties', {
                        names: [name]
                    }, dfd, {},
                    function(e, status, xhr, dfd) {
                        dfd.resolve(e.result.properties[name]);
                    }
                );

                return dfd.promise();
            },

            /**
             * @param {Array} names .
             * @return {$.Promise} .
             */
            getProperties: function(names) {
                var dfd = new $.Deferred();

                monaca.cloud._post('Device.getProperties', {
                    names: names
                }, dfd, {},
                function(e, status, xhr, dfd) {
                    dfd.resolve(e.result.properties);
                }
            );

            return dfd.promise();
        },

        /**
         * @param {String} name .
         * @param {String} value .
         * @return {$.Promise} .
         */
        saveProperty: function(name, value) {
            var dfd = new $.Deferred();
            var param = {};

            if ((typeof(name) !== 'undefined') && (typeof(value) !== 'undefined')) {
                param = {
                    properties: {}
                };
                param.properties[name] = value;
            }

            monaca.cloud._post('Device.saveProperties', param, dfd);

            return dfd.promise();
        },

        /**
         * @param {Object} properties .
         * @return {$.Promise} .
         */
        saveProperties: function(properties) {
            var dfd = new $.Deferred();
            var param = {};

            if (typeof(properties) !== 'undefined') param.properties = properties;
            monaca.cloud._post('Device.saveProperties', param, dfd);

            return dfd.promise();
        }

    };

})(this);
/*
 * Mailer
 */
(function(root) {

    var monaca = root.monaca = root.monaca || {};
    monaca.cloud = monaca.cloud || {};
    var $ = monaca.cloud.$;

    /**
     * @class
     */
    monaca.cloud.Mailer = {

        /**
         * @param {String} userOid .
         * @param {String} templateName .
         * @param {Object} substituteParams .
         * @param {Object} [options] .
         * @return {$.Promise} .
         */
        sendMail: function(userOid, templateName, substituteParams, options) {
            var dfd = new $.Deferred();

            if (typeof(options) === 'undefined') {
                options = {};
            }

            monaca.cloud._post('Mailer.sendMail', {
                userOid: userOid,
                templateName: templateName,
                substituteParams: substituteParams,
                options: options
            }, dfd);

            return dfd.promise();
        }
    };

})(this);
/*
 * User
 */
(function(root) {

    var monaca = root.monaca = root.monaca || {};
    monaca.cloud = monaca.cloud || {};
    var $ = monaca.cloud.$;

    /**
     * @class
     */
    monaca.cloud.User = (function() {


        return {

            _oid: null,

            /**
             * @return {Boolean} .
             */
            isAuthenticated: function() {
                return (this._oid === null) ? false : true;
            },


            /**
             * @param {String} username .
             * @param {String} password .
             * @param {Object} [properties] .
             * @return {$.Promise} .
             */
            register: function(username, password, properties) {
                var dfd = new $.Deferred();
                var self = this;

                if (typeof(properties) === 'undefined') properties = {};

                monaca.cloud._post('User.register', {
                    username: username,
                    password: password,
                    properties: properties
                }, dfd, {},
                function(jsonResponse) {
                    self._oid = jsonResponse.result.user._id;
                }
            );


            return dfd.promise();
        },

        /**
         * @param {String} username .
         * @param {Object} properties .
         * @return {$.Promise} .
         */
        validate: function(username, properties) {
            var dfd = new $.Deferred();

            monaca.cloud._post('User.validate', {
                username: username,
                properties: properties
            }, dfd);

            return dfd.promise();
        },

        /**
         * @param {String} password .
         * @return {$.Promise} .
         */
        unregister: function(password) {
            var self = this,
                dfd = new $.Deferred();

            monaca.cloud._post('User.unregister', {
                password: password
            }, dfd, {},
            function() {
                self._oid = null;
                monaca.cloud._setSessionId('');
                localStorage.removeItem('monacaCloudLoginToken');
            }
        );

        return dfd.promise();
    },

    /**
     * @param {String} username .
     * @param {String} password .
     * @return {$.Promise} .
     */
    login: function(username, password) {
        var self = this,
            dfd = new $.Deferred();

        monaca.cloud._post('User.login', {
            username: username,
            password: password
        }, dfd, {},
        function(jsonResponse) {
            self._oid = jsonResponse.result.user._id;
        }
    );

    return dfd.promise();
},

/**
 * @return {$.Promise} .
 */
autoLogin: function() {
    var dfd = new $.Deferred();
    var token = localStorage.monacaCloudLoginToken || '';
    var self = this;

    monaca.cloud._post('User.autoLogin', {
        loginToken: token
    }, dfd, {},
    function(jsonResponse) {
        self._oid = jsonResponse.result.user._id;
    }
);

return dfd.promise();
},

/**
 * @return {$.Promise} .
 */
logout: function() {
    var self = this,
        dfd = new $.Deferred();

    monaca.cloud._post('User.logout', {}, dfd, {},
        function() {
            self._oid = null;
            monaca.cloud._setSessionId('');
            localStorage.removeItem('monacaCloudLoginToken');
        }
    );

    return dfd.promise();
},

/**
 * @param {String} oldPassword .
 * @param {String} newPassword .
 * @return {$.Promise} .
 */
updatePassword: function(oldPassword, newPassword) {
    var dfd = new $.Deferred();

    monaca.cloud._post('User.updatePassword', {
        oldPassword: oldPassword,
        newPassword: newPassword
    }, dfd);

    return dfd.promise();
},

/**
 * @param {String} username .
 * @param {Object} options .
 * @return {$.Promise} .
 */
sendPasswordResetToken: function(username, options) {
    var dfd = new $.Deferred();

    monaca.cloud._post('User.sendPasswordResetToken', {
        username: username,
        options: options
    }, dfd);

    return dfd.promise();
},

/**
 * @param {String} username .
 * @param {String} newPassword .
 * @param {String} token .
 * @return {$.Promise} .
 */
resetPasswordAndLogin: function(username, newPassword, token) {
    var dfd = new $.Deferred();
    var self = this;

    monaca.cloud._post('User.resetPasswordAndLogin', {
        username: username,
        newPassword: newPassword,
        token: token
    }, dfd, {},
    function(jsonResponse) {
        self._oid = jsonResponse.result.user._id;
    }
);

return dfd.promise();
},

/**
 * @param {String} name .
 * @return {$.Promise} .
 */
getProperty: function(name) {
    var dfd = new $.Deferred();

    monaca.cloud._post('User.getProperties', {
        names: [name]
    }, dfd, {},
    function(e, status, xhr, dfd) {
        dfd.resolve(e.result.properties[name]);
    }
);

return dfd.promise();
},

/**
 * @param {Array} names .
 * @return {$.Promise} .
 */
getProperties: function(names) {
    var dfd = new $.Deferred();

    monaca.cloud._post('User.getProperties', {
        names: names
    }, dfd, {},
    function(e, status, xhr, dfd) {
        dfd.resolve(e.result.properties);
    }
);

return dfd.promise();
},

/**
 * @param {String} name .
 * @param {String} value .
 * @return {$.Promise} .
 */
saveProperty: function(name, value) {
    var dfd = new $.Deferred();
    var param = {};

    if (typeof(name) !== 'undefined') {
        param = {
            properties: {}
        };
        param.properties[name] = value;
    }

    monaca.cloud._post('User.saveProperties', param, dfd);

    return dfd.promise();
},

/**
 * @param {Object} properties .
 * @return {$.Promise} .
 */
saveProperties: function(properties) {
    var dfd = new $.Deferred();
    var param = {};

    if (typeof(properties) !== 'undefined') param.properties = properties;
    monaca.cloud._post('User.saveProperties', param, dfd);

    return dfd.promise();
}

};
})();

})(this);
