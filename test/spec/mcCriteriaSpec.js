'use strict';

describe('mcCriteria', function () {

    beforeEach(module('monaca.cloud'));

    var mcCriteria;
    beforeEach(inject(function (_mcCriteria_) {
        mcCriteria = _mcCriteria_;
    }));

    it('defined', function () {
        expect(!!mcCriteria).toBe(true);
        expect(mcCriteria).toBe(monaca.cloud.Criteria);
    });
});
