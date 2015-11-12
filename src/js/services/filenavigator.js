(function (angular) {
    'use strict';
    angular.module('FileManagerApp').service('fileNavigator', [
        '$http', '$q', 'fileManagerConfig', 'item', function ($http, $q, fileManagerConfig, Item) {

//        $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            $http.defaults.headers.common['X-BL-orgid'] = '31';
            $http.defaults.headers.common['X-BL-username'] = 'jel';

            var FileNavigator = function () {
                this.requesting = false;
                this.fileList = [];
                this.currentPath = [];
                this.history = [];
                this.error = '';
            };

            FileNavigator.prototype.setOrgId = function (orgId) {
                $http.defaults.headers.common['X-BL-orgid'] = orgId;
                this.goTo(-1);
            };

            FileNavigator.prototype.deferredHandler = function (data, deferred, defaultMsg) {
                if (!data || typeof data !== 'object') {
                    this.error = 'Bridge response error, please check the docs';
                }
                if (!this.error && data.result && data.result.error) {
                    this.error = data.result.error;
                }
                if (!this.error && data.error) {
                    this.error = data.error.message;
                }
                if (!this.error && defaultMsg) {
                    this.error = defaultMsg;
                }
                if (this.error) {
                    return deferred.reject(data);
                }
                return deferred.resolve(data);
            };

            FileNavigator.prototype.list = function () {
                var self = this;
                var deferred = $q.defer();
                var path = self.currentPath.join('/') + '/';
                self.requesting = true;
                self.fileList = [];
                self.error = '';
                $http.get(fileManagerConfig.baseUrl + path).success(function (data) {
                    self.deferredHandler(data, deferred);
                }).error(function (data) {
                    self.deferredHandler(data, deferred, 'Unknown error listing, check the response');
                })['finally'](function () {
                    self.requesting = false;
                });
                return deferred.promise;
            };

            FileNavigator.prototype.refresh = function () {
                var self = this;
                var path = self.currentPath.join('/');
                return self.list().then(function (data) {
                    self.fileList = (data || []).map(function (file) {
                        return new Item(file, self.currentPath);
                    });
                    self.buildTree(path);
                });
            };

            FileNavigator.prototype.buildTree = function (path) {
                function recursive(parent, item, path) {
                    var absName = path ? (path + '/' + item.model.name) : item.model.name;
                    if (parent.name.trim() && path.trim().indexOf(parent.name) !== 0) {
                        parent.nodes = [];
                    }
                    if (parent.name !== path) {
                        for (var i in parent.nodes) {
                            recursive(parent.nodes[i], item, path);
                        }
                    } else {
                        for (var e in parent.nodes) {
                            if (parent.nodes[e].name === absName) {
                                return;
                            } else {
                            }
                        }
                        parent.nodes.push({item: item, name: absName, nodes: []});
                    }
                    parent.nodes = parent.nodes.sort(function (a, b) {
                        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() === b.name.toLowerCase() ? 0 : 1;
                    });
                }

                !this.history.length && this.history.push({name: '', nodes: []});
                function flatten(node, array) {
                    array.push(node);
                    for(var n in node.nodes) {
                        flatten(node.nodes[n],array);
                    }
                }
                function findNode(data, path) {
                    return data.filter(function (n) {
                        return n.name === path;
                    })[0];
                }
                var flatNodes = [];
                flatten(this.history[0],flatNodes);
                var selectedNode = findNode(flatNodes, path);
                selectedNode.nodes = [];

                for (var o in this.fileList) {
                    var item = this.fileList[o];
                    item.isFolder() && recursive(this.history[0], item, path);
                }

            };

            FileNavigator.prototype.folderClick = function (item) {
                this.currentPath = [];
                if (item && item.isFolder()) {
                    this.currentPath = item.model.fullPath().split('/').splice(1);
                }
                this.refresh();
            };

            FileNavigator.prototype.upDir = function () {
                if (this.currentPath[0]) {
                    this.currentPath = this.currentPath.slice(0, -1);
                    this.refresh();
                }
            };

            FileNavigator.prototype.goTo = function (index) {
                this.currentPath = this.currentPath.slice(0, index + 1);
                this.refresh();
            };

            FileNavigator.prototype.fileNameExists = function (fileName) {
                for (var item in this.fileList) {
                    item = this.fileList[item];
                    if (fileName.trim && item.model.name.trim() === fileName.trim()) {
                        return true;
                    }
                }
            };

            FileNavigator.prototype.listHasFolders = function () {
                for (var item in this.fileList) {
                    if (this.fileList[item].model.isFolder) {
                        return true;
                    }
                }
            };

            return FileNavigator;
        }]);
})(angular);