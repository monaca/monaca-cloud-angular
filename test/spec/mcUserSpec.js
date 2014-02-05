'use strict';

describe('mcUser', function () {

    beforeEach(module('monaca.cloud'));

    var mcUser, rootScope;
    beforeEach(inject(function (_mcUser_, $rootScope) {
        mcUser = _mcUser_;
        rootScope = $rootScope;
    }));

    afterEach(function(){
        rootScope.$apply();
    });

    it('defined', function () {
        expect(!!mcUser).toBe(true);
    });

    describe('isAuthenticated', function() {
        it('work', function() {
            expect(mcUser.isAuthenticated()).toBe(false);
            expect(mcUser.getOid()).toBe(null);
        });
    });

    describe('register', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            var now = Date.now();
            mcUser.register('user' + now, 'pass', {'age': 20}).then(
                spy.resolve, spy.reject
            );

            waitsFor(function() {
                rootScope.$apply();
                return spy.resolve.wasCalled || spy.reject.wasCalled;
            });

            runs(function() {
                expect(spy.resolve).toHaveBeenCalled();
                expect(spy.reject.wasCalled).toBe(false);

                var arg = spy.resolve.mostRecentCall.args[0];
                expect(arg.user._username).toBe('user' + now);
                expect(arg.user.age).toBe(20);
            });
        });
    });

    describe('validate', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            var now = Date.now();
            mcUser.validate('user' + now).then(
                spy.resolve, spy.reject
            );

            waitsFor(function() {
                rootScope.$apply();
                return spy.resolve.wasCalled || spy.reject.wasCalled;
            });

            runs(function() {
                expect(spy.resolve).toHaveBeenCalled();
                expect(spy.reject.wasCalled).toBe(false);

                var arg = spy.resolve.mostRecentCall.args[0];
                expect(arg).toBe('OK');
            });
        });
    });

    describe('login', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            var now = Date.now();
            mcUser.register('user' + now, 'pass', {'age': 20}).then(
                function(res) {
                    return mcUser.login('user' + now, 'pass');
                },
                spy.reject
            ).then(spy.resolve, spy.reject);

            waitsFor(function() {
                rootScope.$apply();
                return spy.resolve.wasCalled || spy.reject.wasCalled;
            });

            runs(function() {
                expect(spy.resolve).toHaveBeenCalled();
                expect(spy.reject.wasCalled).toBe(false);

                var arg = spy.resolve.mostRecentCall.args[0];
                expect(arg.loginToken).toBeDefined();
                expect(arg.user).toBeDefined();
                expect(arg.user._username).toBe('user' + now);

                expect(mcUser.isAuthenticated()).toBe(true);
                expect(mcUser.getOid()).toBe(arg.user._id);
            });
        });
    });
});
