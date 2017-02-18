"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var di = require("akala-core");
var debug = require("debug");
var fs = require("fs");
var mkdirp = require("mkdirp");
var path = require("path");
var gulp = require("gulp");
var ts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var akala = require("akala-server");
var log = debug('domojs:assets');
var VirtualAssetFactory = (function (_super) {
    __extends(VirtualAssetFactory, _super);
    function VirtualAssetFactory(config, bus) {
        return _super.call(this, config, bus) || this;
    }
    VirtualAssetFactory.prototype.build = function () {
        return new VirtualAsset(this.bus);
    };
    return VirtualAssetFactory;
}(akala.ComponentFactory));
VirtualAssetFactory = __decorate([
    di.factory("virtualAsset", '$config', '$bus')
], VirtualAssetFactory);
exports.VirtualAssetFactory = VirtualAssetFactory;
var VirtualAsset = (function (_super) {
    __extends(VirtualAsset, _super);
    function VirtualAsset(bus) {
        return _super.call(this, 'virtualAsset', bus) || this;
    }
    // public register() 
    // {
    //     log('registering client virtual asset at ' + this.route);
    //     this.bus.emit('virtualAsset', { name: this.name, route: this.route, moduleRelativePath: this.moduleRelativePath });
    // }
    VirtualAsset.prototype.getContent = function (name, callback) {
        this.bus.emit('virtualAsset', name, callback);
    };
    VirtualAsset.getFile = function (modules, asset, callback) {
        var self = this;
        log('getting file ' + asset.route);
        fs.exists('./virtualAsset' + asset.route, function (exists) {
            if (!exists) {
                log('preparing virtualasset cache ' + asset.route);
                mkdirp(path.dirname('./virtualAsset' + asset.route), function () {
                    VirtualAsset.watchThenBuild(modules, asset, function () {
                        fs.exists('./virtualAsset' + asset.route, function (exists) {
                            if (exists)
                                callback(fs.createReadStream('./virtualAsset' + asset.route));
                            else
                                callback(null);
                        });
                    });
                });
            }
            else
                callback(fs.createReadStream('./virtualAsset' + asset.route));
        });
    };
    VirtualAsset.watchThenBuild = function (modules, asset, callback) {
        log('watching then building virtual asset', asset.name || asset.route);
        gulp.add('watch-' + (asset.name || asset.route), function () {
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
        VirtualAsset.build(modules, asset, callback);
        gulp.start(['watch-' + (asset.name || asset.route), 'build-' + (asset.name || asset.route)]);
    };
    VirtualAsset.build = function (modules, asset, callback) {
        log('building virtual asset', asset.name || asset.route);
        if (!gulp.hasTask('build-' + (asset.name || asset.route)))
            gulp.add('build-' + (asset.name || asset.route), function () {
                var project = ts.createProject(asset.tsconfig, { outFile: path.basename(asset.route), module: 'amd', target: 'es6', experimentalDecorators: true });
                gulp.src('./modules/\*' + asset.moduleRelativePath)
                    .pipe(sourcemaps.init())
                    .pipe(project())
                    .pipe(sourcemaps.write())
                    .pipe(gulp.dest('./virtualAsset' + path.dirname(asset.route)));
            });
        if (callback) {
            var callbackCalled_1 = false;
            gulp.start(['build-' + (asset.name || asset.route)]).on('stop', function () {
                if (!callbackCalled_1)
                    callback();
                callbackCalled_1 = true;
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
    };
    return VirtualAsset;
}(akala.Component));
exports.VirtualAsset = VirtualAsset;

//# sourceMappingURL=virtual.js.map
