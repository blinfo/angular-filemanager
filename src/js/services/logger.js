(function () {
    'use strict';
    angular.module('FileManagerApp').factory('logger', logger);

    logger.$inject = ['toastr'];
    function logger(toastr) {
        
        var source = new EventSource('http://navet-file-dev.jelastic.elastx.net/navet-file-api/resources/logs/events?orgId=12');
        
        var service = {
            start : start,
            stop : stop
        };
        return service;
        
        function start() {
            
            source.addEventListener('log-entry', function (e) {
                var data = JSON.parse(e.data);
                toastr.info(data.file, data.action);
            });

            
            source.addEventListener('open', function (e) {
                toastr.info('Connection opened');
            }, false);
            
            source.addEventListener('close', function (e) {
                toastr.info('Connection closed');
            }, false);

            source.addEventListener('error', function (e) {
                toastr.error('Connection error');
                if (e.readyState === EventSource.CLOSED) {
                    // Connection was closed.
                    toastr.error('Connection closed');
                }
            }, false);
        }
        
        function stop() {
            source.close();
        }
    }
})();

