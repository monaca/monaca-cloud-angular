'use strict';

describe('mcDevice', function () {

    beforeEach(module('monaca.cloud'));

    var mcDevice, rootScope;
    beforeEach(inject(function (_mcDevice_, $rootScope) {
        mcDevice = _mcDevice_;
        rootScope = $rootScope;
    }));

    afterEach(function(){
        rootScope.$apply();
    });

    it('defined', function () {
        expect(!!mcDevice).toBe(true);
    });

    describe('saveProperty', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcDevice.saveProperty('nickname', 'Monaca').then(
                spy.resolve, spy.reject
            );

            waitsFor(function() {
                rootScope.$apply();
                return spy.resolve.wasCalled || spy.reject.wasCalled;
            });

            runs(function() {
                expect(spy.resolve).toHaveBeenCalled();
                expect(spy.reject.wasCalled).toBe(false);

                var args = spy.resolve.mostRecentCall.args;
                expect(args[0]).toBe('OK');
            });
        });
    });

    describe('saveProperties', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcDevice.saveProperties({
                'nickname': 'Monaca',
                'color': '#9999FF'
            }).then(
                spy.resolve, spy.reject
            );

            waitsFor(function() {
                rootScope.$apply();
                return spy.resolve.wasCalled || spy.reject.wasCalled;
            });

            runs(function() {
                expect(spy.resolve).toHaveBeenCalled();
                expect(spy.reject.wasCalled).toBe(false);

                var args = spy.resolve.mostRecentCall.args;
                expect(args[0]).toBe('OK');
            });
        });
    });


    describe('getProperty', function() {
        // Runs after saveProperties. Hmm...
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcDevice.getProperty('nickname').then(
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
                expect(arg).toBe('Monaca');
            });
        });
    });

    describe('getProperties', function() {
        // Runs after saveProperties. Hmm...
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcDevice.getProperties().then(
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
                expect(arg.nickname).toBe('Monaca');
                expect(arg.color).toBe('#9999FF');
            });
        });
    });
});
