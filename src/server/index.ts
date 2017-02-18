import * as di from 'akala-core';
import * as debug from 'debug';
var log = debug('domojs:assets');

di.injectWithName(['$master'], function (master)
{
    master(module.filename, './master', './virtual');
})();

export * from './virtual';