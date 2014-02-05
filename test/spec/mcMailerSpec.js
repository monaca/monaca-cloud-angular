'use strict';

describe('mcMailer', function () {

    beforeEach(module('monaca.cloud'));

    var mcMailer, rootScope;
    beforeEach(inject(function (_mcMailer_, $rootScope) {
        mcMailer = _mcMailer_;
        rootScope = $rootScope;
    }));

    afterEach(function(){
        rootScope.$apply();
    });

    it('defined', function () {
        expect(!!mcMailer).toBe(true);
    });

    describe('sendMailer', function() {
        it('work', function() {
            var spy = jasmine.createSpyObj('spy', ['resolve', 'reject']);

            spyOn(monaca.cloud.Mailer, 'sendMail').andCallFake(function() {
                var dfd = new $.Deferred();
                dfd.resolve({'jsonrpc':'2.0','id':'1','result':'OK'});
                return dfd.promise();
            });

            mcMailer.sendMail(
                'userOid', 'template_a', {'name': 'John'}, {'emailPropertyName': 'email'}
            ).then(spy.resolve, spy.reject);

            waitsFor(function() {
                rootScope.$apply();
                return spy.resolve.wasCalled || spy.reject.wasCalled;
            });

            runs(function() {
                expect(spy.resolve).toHaveBeenCalled();
                expect(spy.reject.wasCalled).toBe(false);
                var arg = spy.resolve.mostRecentCall.args[0];
                expect(arg.result).toBe('OK');

                expect(monaca.cloud.Mailer.sendMail).toHaveBeenCalled();
                var args = monaca.cloud.Mailer.sendMail.mostRecentCall.args;
                expect(args[0]).toBe('userOid');
                expect(args[1]).toBe('template_a');
                expect(args[2]).toEqual({name: 'John'});
                expect(args[3]).toEqual({emailPropertyName: 'email'});
            });
        });
    });
});
