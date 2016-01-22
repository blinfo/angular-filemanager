(function () {
    'use strict';
    angular.module("FileManagerApp").factory('tokenInjector', ['SessionService', function (SessionService) {
            var tokenInjector = {
                request: function (config) {
                    if (!SessionService.isAnonymus) {
                        config.headers['X-BL-orgid'] = SessionService.orgId;
                        config.headers['X-BL-username'] = SessionService.username;
//                        $http.defaults.headers.common['X-BL-orgid'] = '31';
//                        $http.defaults.headers.common['X-BL-username'] = 'jel';
                    }
                    return config;
                }
            };
            return tokenInjector;
        }]);

    angular.module("FileManagerApp").config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('tokenInjector');
        }]);
})();

