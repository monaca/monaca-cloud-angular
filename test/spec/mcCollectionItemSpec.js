'use strict';

describe('mcCollectionItem', function () {

    beforeEach(module('monaca.cloud'));

    var mcCollectionItem, mcCollection, rootScope;
    beforeEach(inject(function (_mcCollectionItem_, _mcCollection_, $rootScope) {
        mcCollectionItem = _mcCollectionItem_;
        mcCollection = _mcCollection_;
        rootScope = $rootScope;
    }));

    afterEach(function(){
        rootScope.$apply();
    });

    it('defined', function () {
        expect(!!mcCollectionItem).toBe(true);
    });

    var item = null;
    beforeEach(function() {
        var end = jasmine.createSpy('end');

        var _item = null;
        var now = Date.now();
        mcCollection('diary').insert({
            title: 'Any title' + now,
            body: 'Hello World' + now
        }).then(function(item) {
            var criteria = monaca.cloud.Criteria('_id == ?', [item._id]);
            return mcCollection('diary').findOne(criteria);
        }, end).then(function(res) {
            _item = res;
            end();
        }, end);

        waitsFor(function() {
            rootScope.$apply();
            return end.wasCalled;
        });

        runs(function() {
            item = _item;
        });
    });

    describe('update', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            item.body = 'Goodby World';

            mcCollectionItem.update(item).then(
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

    describe('getPermission', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcCollectionItem.getPermission(item).then(
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
                expect(arg.permission).toBeDefined();
                expect(arg.permission.public).toBeDefined();
            });
        });
    });

    describe('updatePermission', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            var permission = {public: 'rw'};
            permission['oidOfUserB'] = 'rw';

            mcCollectionItem.updatePermission(item, permission).then(
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
                expect(arg.numUpdates).toBe(1);
            });
        });
    });

    describe('delete', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            mcCollectionItem.delete(item).then(
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
});
