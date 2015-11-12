(function () {
    'use strict';
    angular.module('FileManagerApp').service('logger', logger);

    logger.$inject = ['toastr'];
    function logger(toastr) {
        var source = new EventSource('http://navet-file-dev.jelastic.elastx.net/navet-file-api/resources/logs/events?orgId=12');
        source.addEventListener('log-entry', function (e) {
            var data = JSON.parse(e.data);
            toastr.info(data.file, data.action);
        });
        
        source.addEventListener('open', function (e) {
            toastr.info('Connection opened');
        }, false);

        source.addEventListener('error', function (e) {
            toastr.error('Connection error');
            if (e.readyState === EventSource.CLOSED) {
                // Connection was closed.
                toastr.error('Connection closed');
            }   
        }, false);
    }
})();

