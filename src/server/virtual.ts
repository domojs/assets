import * as di from 'akala-core';
import * as debug from 'debug';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as $ from 'underscore';
import * as mkdirp from 'mkdirp';
import * as eachAsync from 'each-async';
import * as path from 'path';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import * as akala from 'akala-server';


var log = debug('domojs:assets');

@di.factory("virtualAsset", '$config', '$bus')
export class VirtualAssetFactory extends akala.ComponentFactory<VirtualAsset>
{
    constructor(config, bus)
    {
        super(config, bus)
    }

    public build()
    {
        return new VirtualAsset(this.bus);
    }
}

export class VirtualAsset extends akala.Component
{
    constructor(bus?: SocketIO.Socket)
    {
        super('virtualAsset', bus);
    }

    // public register() 
    // {
    //     log('registering client virtual asset at ' + this.route);

    //     this.bus.emit('virtualAsset', { name: this.name, route: this.route, moduleRelativePath: this.moduleRelativePath });
    // }

    public getContent(name: string, callback: (content: string) => void)
    {
        this.bus.emit('virtualAsset', name, callback);
    }

    public static getFile(modules: string[], asset: VirtualAsset, callback: Function)
    {
        var self = this;
        log('getting file ' + asset.route);
        fs.exists('./virtualAsset' + asset.route, function (exists)
        {
            if (!exists)
            {
                log('preparing virtualasset cache ' + asset.route);
                mkdirp(path.dirname('./virtualAsset' + asset.route), function ()
                {
                    VirtualAsset.watchThenBuild(modules, asset, function ()
                    {
                        fs.exists('./virtualAsset' + asset.route, function (exists)
                        {
                            if (exists)
                                callback(fs.createReadStream('./virtualAsset' + asset.route))
                            else
                                callback(null);
                        });
                    });
                });
            }
            else
                callback(fs.createReadStream('./virtualAsset' + asset.route))
        });
    }

    public static watchThenBuild(modules: string[], asset: VirtualAsset, callback?: Function)
    {
        log('watching then building virtual asset', asset.name || asset.route);
        gulp.add('watch-' + (asset.name || asset.route), function ()
        {
            gulp.watch('./modules/\*' + asset.moduleRelativePath, ['build-' + (asset.name || asset.route)]);
        });
        //     modules.forEach(function (module)
        //     {
        //         fs.exists('./modules/' + module + asset.moduleRelativePath, function (exists)
        //         {

        //             if (exists)
        //                 fs.watchFile('./modules/' + module + asset.moduleRelativePath, function ()
        //                 {
        //                     VirtualAsset.build(modules, asset);
        //                 });
        //         })
        //     });

        VirtualAsset.build(modules, asset, callback)

        gulp.start(['watch-' + (asset.name || asset.route), 'build-' + (asset.name || asset.route)])
    }

    public static build(modules: string[], asset: VirtualAsset, callback?: Function)
    {
        log('building virtual asset', asset.name || asset.route);
        if (!gulp.hasTask('build-' + (asset.name || asset.route)))
            gulp.add('build-' + (asset.name || asset.route), function ()
            {
                var project = ts.createProject(asset.tsconfig, { outFile: path.basename(asset.route), module: 'amd', target: 'es6', experimentalDecorators: true });
                gulp.src('./modules/\*' + asset.moduleRelativePath)
                    .pipe(sourcemaps.init())
                    .pipe(project())
                    .pipe(sourcemaps.write())
                    .pipe(gulp.dest('./virtualAsset' + path.dirname(asset.route)));
            });
        if (callback)
        {
            let callbackCalled = false;
            gulp.start(['build-' + (asset.name || asset.route)]).on('stop', function ()
            {
                if (!callbackCalled)
                    callback();
                callbackCalled = true;
            });
        }
        // var output = fs.createWriteStream('./virtualAsset' + asset.route);

        // eachAsync(modules, function (module, i, next)
        // {
        //     log('testing ./modules/' + module + asset.moduleRelativePath);
        //     fs.exists('./modules/' + module + asset.moduleRelativePath, function (exists)
        //     {
        //         if (exists)
        //         {
        //             log('found ./modules/' + module + asset.moduleRelativePath);
        //             var s = fs.createReadStream('./modules/' + module + asset.moduleRelativePath);
        //             s.pipe(output, { end: false });
        //             s.on('end', next);
        //         }
        //         else
        //             next();
        //     })
        // }, function ()
        //     {
        //         output.end();
        //         if (callback)
        //             callback();
        //     });
    }


    public moduleRelativePath: string;
    public route: string;
    public name: string;
    public tsconfig: string;
}
