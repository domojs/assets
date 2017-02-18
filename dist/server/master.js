"use strict";
var di = require("akala-core");
var debug = require("debug");
var express = require("express");
var log = debug('domojs:asset');
var va = require("./virtual");
var $ = require("underscore");
var assets = {};
di.injectWithName(['$router', '$$modules', '$$socketModules', '$$sockets'], function (router, modules, socketModules, sockets) {
    var assets = {};
    var virtualAssetRouter = express.Router();
    router.use('/assets', virtualAssetRouter);
    $.each(Object.keys(socketModules), function (socket) {
        if (socket == 'assets')
            return;
        log('registering forward for %s', socket);
        socketModules[socket].on('virtualAsset', function (asset) {
            log('forwarding %s', asset);
            socketModules['assets'].emit('virtualAsset', asset);
            log('forwarded %s', asset);
        });
    });
    sockets.on('connection', function (socket) {
        socket.on('virtualAsset', function (asset) {
            log('forwarding %s', asset);
            va.VirtualAsset.watchThenBuild(modules, asset);
            // socketModules['assets'].emit('virtualAsset', asset);
            virtualAssetRouter.use(asset.route, function (req, res, next) {
                va.VirtualAsset.getFile(modules, asset, function (s) {
                    if (!s)
                        res.sendStatus(404).end();
                    else
                        s.pipe(res);
                });
            });
        });
    });
})();

//# sourceMappingURL=master.js.map
