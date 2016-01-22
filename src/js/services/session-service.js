(function () {
    'use strict';
    angular.module("FileManagerApp").factory("SessionService", SessionService);

    function SessionService() {
        var service = {
            orgId: "31",
            username: "jel"
        };
        return service;
    }
})();

