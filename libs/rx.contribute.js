/*
* RxJS Contribute
*
* Copyright (c) 2012 Christoph Burgdorf (http://twitter.com/cburgdorf)
* Licensed under the MIT (https://github.com/cburgdorf/rxjs-contribute/blob/master/license.txt) license.
*/

(function (global) {

    var root;
    if (typeof global.module !== 'undefined' && typeof global.module.exports !== 'undefined') {
        root = global.require('./rx-vsdoc.js');
    } else {
        root = global.Rx;
    }

    var Observable = root.Observable,
        observableProto = Observable.prototype,
        isFunction = function(fun) { return typeof(fun) === "function"; };

    observableProto.whereTrue = function (propertyName) {
        return this.where(function (x) {
            return propertyName === undefined ? x === true : x[propertyName] === true;
        });
    };

    observableProto.whereFalse = function (propertyName) {
        return this.where(function (x) {
            return propertyName === undefined ? x === false : x[propertyName] === false;
        });
    };

    observableProto.wrapAs = function (propertyName) {
        return this.select(function (x) {
            var temp = {};
            temp[propertyName] = x;
            return temp;
        });
    };

    observableProto.appendAs = function (propertyName, data) {
        return this.select(function (x) {
            if (x !== null && typeof (x) == 'object') {
                x[propertyName] = isFunction(data) ? data() : data;
                return x;
            }
            else {
                var temp = {};
                temp[propertyName] = isFunction(data) ? data() : data;
                return temp;
            }
        });
    };

    observableProto.convertProperty = function (propertyFrom, propertyTo, transistorFunc) {
        return this.select(function (x) {
            if (x.hasOwnProperty(propertyFrom) && isFunction(transistorFunc)) {
                x[propertyTo] = transistorFunc(x[propertyFrom]);
            }

            return x;
        });
    };

    observableProto.selectProperty = function (propertyName) {
        return this.select(function (x) {
            if (x.hasOwnProperty(propertyName)) {
                return x[propertyName];
            }

            return x;
        });
    };


    observableProto.selectAs = function (as) {
        return this.select(function (_) {
            return as;
        });
    };

    Observable.forkJoin = function (sources) {

        var tempSources = arguments.length > 1 ? arguments : sources;

        return Rx.Observable
                 .fromArray(tempSources)
                 .selectMany(function (o, i) {
                     return o.takeLast(1).select(function (value) { return { i: i, value: value }; });
                 })

                 .aggregate({ array: [], count: 0 }, function (results, result) {
                     results.array[result.i] = result.value;
                     return {
                         array: results.array,
                         count: results.count + 1
                     };
                 })
                 .where(function (results) { return results.count === tempSources.length; })
                 .select(function (results) { return results.array; });
    };

    observableProto.combineLatestOnLeft = function (rightSource, selector) {

        return this.timestamp()
                   .combineLatest(rightSource.timestamp(), function (l, r) {
                       return {
                           Left: l,
                           Right: r
                       };
                   })
                    .where(function (x) {
                        return x.Left.timestamp >= x.Right.timestamp;
                    })
                    .select(function (x) {
                        return selector(x.Left.value, x.Right.value);
                    });

    };

})(this);


