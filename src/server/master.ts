import * as di from 'akala-core';
import * as debug from 'debug';
import * as express from 'express';
var log = debug('domojs:asset');
import * as va from './virtual';
import * as io from 'socket.io';
import * as $ from 'underscore';
import * as fs from 'fs';

var assets = {};
di.injectWithName(['$router', '$$modules', '$$socketModules', '$$sockets'], function (router: express.Router, modules: string[], socketModules: { [key: string]: SocketIO.Socket }, sockets: SocketIO.Server)
{

    var assets = {};
    var virtualAssetRouter = express.Router();

    router.use('/assets', virtualAssetRouter);

    $.each(Object.keys(socketModules), function (socket)
    {
        if (socket == 'assets')
            return;
        log('registering forward for %s', socket);
        socketModules[socket].on('virtualAsset', function (asset: va.VirtualAsset)
        {
            log('forwarding %s', asset);
            socketModules['assets'].emit('virtualAsset', asset);
            log('forwarded %s', asset);
        })
    });

    sockets.on('connection', function (socket)
    {
        socket.on('virtualAsset', function (asset: va.VirtualAsset)
        {
            log('forwarding %s', asset);
            va.VirtualAsset.watchThenBuild(modules, asset);
            // socketModules['assets'].emit('virtualAsset', asset);
            virtualAssetRouter.use(asset.route, function (req, res, next)
            {
                va.VirtualAsset.getFile(modules, asset, function (s: fs.ReadStream)
                {
                    if (!s)
                        res.sendStatus(404).end();
                    else
                        s.pipe(res);
                })
            });
        });
    });
})();