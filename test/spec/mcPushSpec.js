'use strict';

describe('mcPush', function () {

    beforeEach(module('monaca.cloud'));

    var mcPush;
    beforeEach(inject(function (_mcPush_) {
        mcPush = _mcPush_;
    }));

    it('defined', function () {
        expect(!!mcPush).toBe(true);
    });

    describe('setHandler', function() {
        it('work', function() {
            spyOn(monaca.cloud.Push, 'setHandler').andCallThrough();

            var callback = function() {};
            mcPush.setHandler(callback);

            expect(monaca.cloud.Push.setHandler).toHaveBeenCalled();
            var args = monaca.cloud.Push.setHandler.mostRecentCall.args;
            expect(args[0]).toBe(callback);
        });
    });
});
