'use strict';

describe('MonacaBackend', function () {

    beforeEach(module('monaca.cloud'));

    var MonacaBackend;
    beforeEach(inject(function (_MonacaBackend_) {
        MonacaBackend = _MonacaBackend_;
    }));

    it('defined', function () {
        expect(!!MonacaBackend).toBe(true);
    });

    describe('modules', function() {
        it('defined', function() {
            expect(MonacaBackend.Push).toBeDefined();
            expect(MonacaBackend.User).toBeDefined();
            expect(MonacaBackend.Collection).toBeDefined();
            expect(MonacaBackend.CollectionItem).toBeDefined();
            expect(MonacaBackend.Criteria).toBeDefined();
            expect(MonacaBackend.Device).toBeDefined();
            expect(MonacaBackend.Mailer).toBeDefined();
            expect(MonacaBackend.Util).toBeDefined();
        });
    });
});
