'use strict';

describe('mcCollection', function () {

    var now = Date.now();

    beforeEach(module('monaca.cloud'));

    var mcCollection, rootScope;
    beforeEach(inject(function (_mcCollection_, $rootScope) {
        mcCollection = _mcCollection_;
        rootScope = $rootScope;
    }));

    afterEach(function(){
        rootScope.$apply();
    });

    it('defined', function () {
        expect(!!mcCollection).toBe(true);
    });

    describe('insert', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcCollection('diary').insert({
                title: 'Any title' + now,
                body: 'Hello World' + now
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

                var arg = spy.resolve.mostRecentCall.args[0];
                expect(arg._id).toBeDefined();
                expect(arg.title).toBe('Any title' + now);
                expect(arg.body).toBe('Hello World' + now);
                expect(arg._createdAt).toBeDefined();
                expect(arg._updatedAt).toBeDefined();
            });
        });
    });

    describe('find', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcCollection('diary').find().then(
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
                expect(arg.totalItems).toEqual(jasmine.any(Number));
                expect(arg.items).toEqual(jasmine.any(Array));
            });
        });
    });

    describe('findOne', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcCollection('diary').findOne().then(
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
                expect(arg._id).toBeDefined();
                expect(arg._createdAt).toBeDefined();
                expect(arg._updatedAt).toBeDefined();
            });
        });
    });
});
