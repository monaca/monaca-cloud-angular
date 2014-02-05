'use strict';

describe('mcUtil', function () {

    beforeEach(module('monaca.cloud'));

    var mcUtil, rootScope;
    beforeEach(inject(function (_mcUtil_, $rootScope) {
        mcUtil = _mcUtil_;
        rootScope = $rootScope;
    }));

    afterEach(function(){
        rootScope.$apply();
    });

    it('defined', function () {
        expect(!!mcUtil).toBe(true);
    });

    describe('promise', function() {
        it('work resolve', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            var dfd = new $.Deferred();
            var jqPromise = dfd.promise();

            mcUtil.promise(jqPromise).then(
                spy.resolve, spy.reject
            );

            waitsFor(function() {
                dfd.resolve('OK');
                rootScope.$apply();
                return true;
            });

            runs(function() {
                expect(spy.resolve).toHaveBeenCalled();
                expect(spy.reject.wasCalled).toBe(false);

                var args = spy.resolve.mostRecentCall.args;
                expect(args[0]).toBe('OK');
            });
        });

        it('work reject', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            var dfd = new $.Deferred();
            var jqPromise = dfd.promise();

            mcUtil.promise(jqPromise).then(
                spy.resolve, spy.reject
            );

            waitsFor(function() {
                dfd.reject('NG');
                rootScope.$apply();
                return true;
            });

            runs(function() {
                expect(spy.reject).toHaveBeenCalled();
                expect(spy.resolve.wasCalled).toBe(false);

                var args = spy.reject.mostRecentCall.args;
                expect(args[0]).toBe('NG');
            });
        });
    });
});
