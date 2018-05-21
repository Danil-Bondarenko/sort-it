const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');

const {NoEmitOnErrorsPlugin, SourceMapDevToolPlugin, NamedModulesPlugin} = require('webpack');
const {NamedLazyChunksWebpackPlugin, BaseHrefWebpackPlugin} = require('@angular/cli/plugins/webpack');
const {CommonsChunkPlugin} = require('webpack').optimize;
const {AngularCompilerPlugin, ExtractI18nPlugin} = require('@ngtools/webpack');

const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
const entryPoints = ["inline", "polyfills", "sw-register", "styles", "vendor", "main"];
const minimizeCss = false;
const baseHref = "";
const deployUrl = "";
const postcssPlugins = function () {
    // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
    const importantCommentRe = /@preserve|@license|[@#]\s*source(?:Mapping)?URL|^!/i;
    const minimizeOptions = {
        autoprefixer: false,
        safe: true,
        mergeLonghand: false,
        discardComments: {remove: (comment) => !importantCommentRe.test(comment)}
    };
    return [
        postcssUrl({
            url: (URL) => {
                // Only convert root relative URLs, which CSS-Loader won't process into require().
                if (!URL.startsWith('/') || URL.startsWith('//')) {
                    return URL;
                }
                if (deployUrl.match(/:\/\//)) {
                    // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
                    return `${deployUrl.replace(/\/$/, '')}${URL}`;
                }
                else if (baseHref.match(/:\/\//)) {
                    // If baseHref contains a scheme, include it as is.
                    return baseHref.replace(/\/$/, '') +
                        `/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
                }
                else {
                    // Join together base-href, deploy-url and the original URL.
                    // Also dedupe multiple slashes into single ones.
                    return `/${baseHref}/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
                }
            }
        }),
        autoprefixer(),
        customProperties({preserve: true})
    ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
};

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const environmentFiles = {
    'development': 'environments/environment.ts',
    'staging': 'environments/environment.stag.ts',
    'production': 'environments/environment.prod.ts'
};

module.exports = {
    "resolve": {
        "extensions": [
            ".ts",
            ".js"
        ],
        "modules": [
            "./node_modules"
        ],
        "symlinks": true,
        "alias": {
            "rxjs/AsyncSubject": path.resolve("./node_modules/rxjs/_esm5/AsyncSubject.js"),
            "rxjs/BehaviorSubject": path.resolve("./node_modules/rxjs/_esm5/BehaviorSubject.js"),
            "rxjs/InnerSubscriber": path.resolve("./node_modules/rxjs/_esm5/InnerSubscriber.js"),
            "rxjs/Notification": path.resolve("./node_modules/rxjs/_esm5/Notification.js"),
            "rxjs/Observable": path.resolve("./node_modules/rxjs/_esm5/Observable.js"),
            "rxjs/Observer": path.resolve("./node_modules/rxjs/_esm5/Observer.js"),
            "rxjs/Operator": path.resolve("./node_modules/rxjs/_esm5/Operator.js"),
            "rxjs/OuterSubscriber": path.resolve("./node_modules/rxjs/_esm5/OuterSubscriber.js"),
            "rxjs/ReplaySubject": path.resolve("./node_modules/rxjs/_esm5/ReplaySubject.js"),
            "rxjs/Rx": path.resolve("./node_modules/rxjs/_esm5/Rx.js"),
            "rxjs/Scheduler": path.resolve("./node_modules/rxjs/_esm5/Scheduler.js"),
            "rxjs/Subject": path.resolve("./node_modules/rxjs/_esm5/Subject.js"),
            "rxjs/SubjectSubscription": path.resolve("./node_modules/rxjs/_esm5/SubjectSubscription.js"),
            "rxjs/Subscriber": path.resolve("./node_modules/rxjs/_esm5/Subscriber.js"),
            "rxjs/Subscription": path.resolve("./node_modules/rxjs/_esm5/Subscription.js"),
            "rxjs/add/observable/bindCallback": path.resolve("./node_modules/rxjs/_esm5/add/observable/bindCallback.js"),
            "rxjs/add/observable/bindNodeCallback": path.resolve("./node_modules/rxjs/_esm5/add/observable/bindNodeCallback.js"),
            "rxjs/add/observable/combineLatest": path.resolve("./node_modules/rxjs/_esm5/add/observable/combineLatest.js"),
            "rxjs/add/observable/concat": path.resolve("./node_modules/rxjs/_esm5/add/observable/concat.js"),
            "rxjs/add/observable/defer": path.resolve("./node_modules/rxjs/_esm5/add/observable/defer.js"),
            "rxjs/add/observable/dom/ajax": path.resolve("./node_modules/rxjs/_esm5/add/observable/dom/ajax.js"),
            "rxjs/add/observable/dom/webSocket": path.resolve("./node_modules/rxjs/_esm5/add/observable/dom/webSocket.js"),
            "rxjs/add/observable/empty": path.resolve("./node_modules/rxjs/_esm5/add/observable/empty.js"),
            "rxjs/add/observable/forkJoin": path.resolve("./node_modules/rxjs/_esm5/add/observable/forkJoin.js"),
            "rxjs/add/observable/from": path.resolve("./node_modules/rxjs/_esm5/add/observable/from.js"),
            "rxjs/add/observable/fromEvent": path.resolve("./node_modules/rxjs/_esm5/add/observable/fromEvent.js"),
            "rxjs/add/observable/fromEventPattern": path.resolve("./node_modules/rxjs/_esm5/add/observable/fromEventPattern.js"),
            "rxjs/add/observable/fromPromise": path.resolve("./node_modules/rxjs/_esm5/add/observable/fromPromise.js"),
            "rxjs/add/observable/generate": path.resolve("./node_modules/rxjs/_esm5/add/observable/generate.js"),
            "rxjs/add/observable/if": path.resolve("./node_modules/rxjs/_esm5/add/observable/if.js"),
            "rxjs/add/observable/interval": path.resolve("./node_modules/rxjs/_esm5/add/observable/interval.js"),
            "rxjs/add/observable/merge": path.resolve("./node_modules/rxjs/_esm5/add/observable/merge.js"),
            "rxjs/add/observable/never": path.resolve("./node_modules/rxjs/_esm5/add/observable/never.js"),
            "rxjs/add/observable/of": path.resolve("./node_modules/rxjs/_esm5/add/observable/of.js"),
            "rxjs/add/observable/onErrorResumeNext": path.resolve("./node_modules/rxjs/_esm5/add/observable/onErrorResumeNext.js"),
            "rxjs/add/observable/pairs": path.resolve("./node_modules/rxjs/_esm5/add/observable/pairs.js"),
            "rxjs/add/observable/race": path.resolve("./node_modules/rxjs/_esm5/add/observable/race.js"),
            "rxjs/add/observable/range": path.resolve("./node_modules/rxjs/_esm5/add/observable/range.js"),
            "rxjs/add/observable/throw": path.resolve("./node_modules/rxjs/_esm5/add/observable/throw.js"),
            "rxjs/add/observable/timer": path.resolve("./node_modules/rxjs/_esm5/add/observable/timer.js"),
            "rxjs/add/observable/using": path.resolve("./node_modules/rxjs/_esm5/add/observable/using.js"),
            "rxjs/add/observable/zip": path.resolve("./node_modules/rxjs/_esm5/add/observable/zip.js"),
            "rxjs/add/operator/audit": path.resolve("./node_modules/rxjs/_esm5/add/operator/audit.js"),
            "rxjs/add/operator/auditTime": path.resolve("./node_modules/rxjs/_esm5/add/operator/auditTime.js"),
            "rxjs/add/operator/buffer": path.resolve("./node_modules/rxjs/_esm5/add/operator/buffer.js"),
            "rxjs/add/operator/bufferCount": path.resolve("./node_modules/rxjs/_esm5/add/operator/bufferCount.js"),
            "rxjs/add/operator/bufferTime": path.resolve("./node_modules/rxjs/_esm5/add/operator/bufferTime.js"),
            "rxjs/add/operator/bufferToggle": path.resolve("./node_modules/rxjs/_esm5/add/operator/bufferToggle.js"),
            "rxjs/add/operator/bufferWhen": path.resolve("./node_modules/rxjs/_esm5/add/operator/bufferWhen.js"),
            "rxjs/add/operator/catch": path.resolve("./node_modules/rxjs/_esm5/add/operator/catch.js"),
            "rxjs/add/operator/combineAll": path.resolve("./node_modules/rxjs/_esm5/add/operator/combineAll.js"),
            "rxjs/add/operator/combineLatest": path.resolve("./node_modules/rxjs/_esm5/add/operator/combineLatest.js"),
            "rxjs/add/operator/concat": path.resolve("./node_modules/rxjs/_esm5/add/operator/concat.js"),
            "rxjs/add/operator/concatAll": path.resolve("./node_modules/rxjs/_esm5/add/operator/concatAll.js"),
            "rxjs/add/operator/concatMap": path.resolve("./node_modules/rxjs/_esm5/add/operator/concatMap.js"),
            "rxjs/add/operator/concatMapTo": path.resolve("./node_modules/rxjs/_esm5/add/operator/concatMapTo.js"),
            "rxjs/add/operator/count": path.resolve("./node_modules/rxjs/_esm5/add/operator/count.js"),
            "rxjs/add/operator/debounce": path.resolve("./node_modules/rxjs/_esm5/add/operator/debounce.js"),
            "rxjs/add/operator/debounceTime": path.resolve("./node_modules/rxjs/_esm5/add/operator/debounceTime.js"),
            "rxjs/add/operator/defaultIfEmpty": path.resolve("./node_modules/rxjs/_esm5/add/operator/defaultIfEmpty.js"),
            "rxjs/add/operator/delay": path.resolve("./node_modules/rxjs/_esm5/add/operator/delay.js"),
            "rxjs/add/operator/delayWhen": path.resolve("./node_modules/rxjs/_esm5/add/operator/delayWhen.js"),
            "rxjs/add/operator/dematerialize": path.resolve("./node_modules/rxjs/_esm5/add/operator/dematerialize.js"),
            "rxjs/add/operator/distinct": path.resolve("./node_modules/rxjs/_esm5/add/operator/distinct.js"),
            "rxjs/add/operator/distinctUntilChanged": path.resolve("./node_modules/rxjs/_esm5/add/operator/distinctUntilChanged.js"),
            "rxjs/add/operator/distinctUntilKeyChanged": path.resolve("./node_modules/rxjs/_esm5/add/operator/distinctUntilKeyChanged.js"),
            "rxjs/add/operator/do": path.resolve("./node_modules/rxjs/_esm5/add/operator/do.js"),
            "rxjs/add/operator/elementAt": path.resolve("./node_modules/rxjs/_esm5/add/operator/elementAt.js"),
            "rxjs/add/operator/every": path.resolve("./node_modules/rxjs/_esm5/add/operator/every.js"),
            "rxjs/add/operator/exhaust": path.resolve("./node_modules/rxjs/_esm5/add/operator/exhaust.js"),
            "rxjs/add/operator/exhaustMap": path.resolve("./node_modules/rxjs/_esm5/add/operator/exhaustMap.js"),
            "rxjs/add/operator/expand": path.resolve("./node_modules/rxjs/_esm5/add/operator/expand.js"),
            "rxjs/add/operator/filter": path.resolve("./node_modules/rxjs/_esm5/add/operator/filter.js"),
            "rxjs/add/operator/finally": path.resolve("./node_modules/rxjs/_esm5/add/operator/finally.js"),
            "rxjs/add/operator/find": path.resolve("./node_modules/rxjs/_esm5/add/operator/find.js"),
            "rxjs/add/operator/findIndex": path.resolve("./node_modules/rxjs/_esm5/add/operator/findIndex.js"),
            "rxjs/add/operator/first": path.resolve("./node_modules/rxjs/_esm5/add/operator/first.js"),
            "rxjs/add/operator/groupBy": path.resolve("./node_modules/rxjs/_esm5/add/operator/groupBy.js"),
            "rxjs/add/operator/ignoreElements": path.resolve("./node_modules/rxjs/_esm5/add/operator/ignoreElements.js"),
            "rxjs/add/operator/isEmpty": path.resolve("./node_modules/rxjs/_esm5/add/operator/isEmpty.js"),
            "rxjs/add/operator/last": path.resolve("./node_modules/rxjs/_esm5/add/operator/last.js"),
            "rxjs/add/operator/let": path.resolve("./node_modules/rxjs/_esm5/add/operator/let.js"),
            "rxjs/add/operator/map": path.resolve("./node_modules/rxjs/_esm5/add/operator/map.js"),
            "rxjs/add/operator/mapTo": path.resolve("./node_modules/rxjs/_esm5/add/operator/mapTo.js"),
            "rxjs/add/operator/materialize": path.resolve("./node_modules/rxjs/_esm5/add/operator/materialize.js"),
            "rxjs/add/operator/max": path.resolve("./node_modules/rxjs/_esm5/add/operator/max.js"),
            "rxjs/add/operator/merge": path.resolve("./node_modules/rxjs/_esm5/add/operator/merge.js"),
            "rxjs/add/operator/mergeAll": path.resolve("./node_modules/rxjs/_esm5/add/operator/mergeAll.js"),
            "rxjs/add/operator/mergeMap": path.resolve("./node_modules/rxjs/_esm5/add/operator/mergeMap.js"),
            "rxjs/add/operator/mergeMapTo": path.resolve("./node_modules/rxjs/_esm5/add/operator/mergeMapTo.js"),
            "rxjs/add/operator/mergeScan": path.resolve("./node_modules/rxjs/_esm5/add/operator/mergeScan.js"),
            "rxjs/add/operator/min": path.resolve("./node_modules/rxjs/_esm5/add/operator/min.js"),
            "rxjs/add/operator/multicast": path.resolve("./node_modules/rxjs/_esm5/add/operator/multicast.js"),
            "rxjs/add/operator/observeOn": path.resolve("./node_modules/rxjs/_esm5/add/operator/observeOn.js"),
            "rxjs/add/operator/onErrorResumeNext": path.resolve("./node_modules/rxjs/_esm5/add/operator/onErrorResumeNext.js"),
            "rxjs/add/operator/pairwise": path.resolve("./node_modules/rxjs/_esm5/add/operator/pairwise.js"),
            "rxjs/add/operator/partition": path.resolve("./node_modules/rxjs/_esm5/add/operator/partition.js"),
            "rxjs/add/operator/pluck": path.resolve("./node_modules/rxjs/_esm5/add/operator/pluck.js"),
            "rxjs/add/operator/publish": path.resolve("./node_modules/rxjs/_esm5/add/operator/publish.js"),
            "rxjs/add/operator/publishBehavior": path.resolve("./node_modules/rxjs/_esm5/add/operator/publishBehavior.js"),
            "rxjs/add/operator/publishLast": path.resolve("./node_modules/rxjs/_esm5/add/operator/publishLast.js"),
            "rxjs/add/operator/publishReplay": path.resolve("./node_modules/rxjs/_esm5/add/operator/publishReplay.js"),
            "rxjs/add/operator/race": path.resolve("./node_modules/rxjs/_esm5/add/operator/race.js"),
            "rxjs/add/operator/reduce": path.resolve("./node_modules/rxjs/_esm5/add/operator/reduce.js"),
            "rxjs/add/operator/repeat": path.resolve("./node_modules/rxjs/_esm5/add/operator/repeat.js"),
            "rxjs/add/operator/repeatWhen": path.resolve("./node_modules/rxjs/_esm5/add/operator/repeatWhen.js"),
            "rxjs/add/operator/retry": path.resolve("./node_modules/rxjs/_esm5/add/operator/retry.js"),
            "rxjs/add/operator/retryWhen": path.resolve("./node_modules/rxjs/_esm5/add/operator/retryWhen.js"),
            "rxjs/add/operator/sample": path.resolve("./node_modules/rxjs/_esm5/add/operator/sample.js"),
            "rxjs/add/operator/sampleTime": path.resolve("./node_modules/rxjs/_esm5/add/operator/sampleTime.js"),
            "rxjs/add/operator/scan": path.resolve("./node_modules/rxjs/_esm5/add/operator/scan.js"),
            "rxjs/add/operator/sequenceEqual": path.resolve("./node_modules/rxjs/_esm5/add/operator/sequenceEqual.js"),
            "rxjs/add/operator/share": path.resolve("./node_modules/rxjs/_esm5/add/operator/share.js"),
            "rxjs/add/operator/shareReplay": path.resolve("./node_modules/rxjs/_esm5/add/operator/shareReplay.js"),
            "rxjs/add/operator/single": path.resolve("./node_modules/rxjs/_esm5/add/operator/single.js"),
            "rxjs/add/operator/skip": path.resolve("./node_modules/rxjs/_esm5/add/operator/skip.js"),
            "rxjs/add/operator/skipLast": path.resolve("./node_modules/rxjs/_esm5/add/operator/skipLast.js"),
            "rxjs/add/operator/skipUntil": path.resolve("./node_modules/rxjs/_esm5/add/operator/skipUntil.js"),
            "rxjs/add/operator/skipWhile": path.resolve("./node_modules/rxjs/_esm5/add/operator/skipWhile.js"),
            "rxjs/add/operator/startWith": path.resolve("./node_modules/rxjs/_esm5/add/operator/startWith.js"),
            "rxjs/add/operator/subscribeOn": path.resolve("./node_modules/rxjs/_esm5/add/operator/subscribeOn.js"),
            "rxjs/add/operator/switch": path.resolve("./node_modules/rxjs/_esm5/add/operator/switch.js"),
            "rxjs/add/operator/switchMap": path.resolve("./node_modules/rxjs/_esm5/add/operator/switchMap.js"),
            "rxjs/add/operator/switchMapTo": path.resolve("./node_modules/rxjs/_esm5/add/operator/switchMapTo.js"),
            "rxjs/add/operator/take": path.resolve("./node_modules/rxjs/_esm5/add/operator/take.js"),
            "rxjs/add/operator/takeLast": path.resolve("./node_modules/rxjs/_esm5/add/operator/takeLast.js"),
            "rxjs/add/operator/takeUntil": path.resolve("./node_modules/rxjs/_esm5/add/operator/takeUntil.js"),
            "rxjs/add/operator/takeWhile": path.resolve("./node_modules/rxjs/_esm5/add/operator/takeWhile.js"),
            "rxjs/add/operator/throttle": path.resolve("./node_modules/rxjs/_esm5/add/operator/throttle.js"),
            "rxjs/add/operator/throttleTime": path.resolve("./node_modules/rxjs/_esm5/add/operator/throttleTime.js"),
            "rxjs/add/operator/timeInterval": path.resolve("./node_modules/rxjs/_esm5/add/operator/timeInterval.js"),
            "rxjs/add/operator/timeout": path.resolve("./node_modules/rxjs/_esm5/add/operator/timeout.js"),
            "rxjs/add/operator/timeoutWith": path.resolve("./node_modules/rxjs/_esm5/add/operator/timeoutWith.js"),
            "rxjs/add/operator/timestamp": path.resolve("./node_modules/rxjs/_esm5/add/operator/timestamp.js"),
            "rxjs/add/operator/toArray": path.resolve("./node_modules/rxjs/_esm5/add/operator/toArray.js"),
            "rxjs/add/operator/toPromise": path.resolve("./node_modules/rxjs/_esm5/add/operator/toPromise.js"),
            "rxjs/add/operator/window": path.resolve("./node_modules/rxjs/_esm5/add/operator/window.js"),
            "rxjs/add/operator/windowCount": path.resolve("./node_modules/rxjs/_esm5/add/operator/windowCount.js"),
            "rxjs/add/operator/windowTime": path.resolve("./node_modules/rxjs/_esm5/add/operator/windowTime.js"),
            "rxjs/add/operator/windowToggle": path.resolve("./node_modules/rxjs/_esm5/add/operator/windowToggle.js"),
            "rxjs/add/operator/windowWhen": path.resolve("./node_modules/rxjs/_esm5/add/operator/windowWhen.js"),
            "rxjs/add/operator/withLatestFrom": path.resolve("./node_modules/rxjs/_esm5/add/operator/withLatestFrom.js"),
            "rxjs/add/operator/zip": path.resolve("./node_modules/rxjs/_esm5/add/operator/zip.js"),
            "rxjs/add/operator/zipAll": path.resolve("./node_modules/rxjs/_esm5/add/operator/zipAll.js"),
            "rxjs/interfaces": path.resolve("./node_modules/rxjs/_esm5/interfaces.js"),
            "rxjs/observable/ArrayLikeObservable": path.resolve("./node_modules/rxjs/_esm5/observable/ArrayLikeObservable.js"),
            "rxjs/observable/ArrayObservable": path.resolve("./node_modules/rxjs/_esm5/observable/ArrayObservable.js"),
            "rxjs/observable/BoundCallbackObservable": path.resolve("./node_modules/rxjs/_esm5/observable/BoundCallbackObservable.js"),
            "rxjs/observable/BoundNodeCallbackObservable": path.resolve("./node_modules/rxjs/_esm5/observable/BoundNodeCallbackObservable.js"),
            "rxjs/observable/ConnectableObservable": path.resolve("./node_modules/rxjs/_esm5/observable/ConnectableObservable.js"),
            "rxjs/observable/DeferObservable": path.resolve("./node_modules/rxjs/_esm5/observable/DeferObservable.js"),
            "rxjs/observable/EmptyObservable": path.resolve("./node_modules/rxjs/_esm5/observable/EmptyObservable.js"),
            "rxjs/observable/ErrorObservable": path.resolve("./node_modules/rxjs/_esm5/observable/ErrorObservable.js"),
            "rxjs/observable/ForkJoinObservable": path.resolve("./node_modules/rxjs/_esm5/observable/ForkJoinObservable.js"),
            "rxjs/observable/FromEventObservable": path.resolve("./node_modules/rxjs/_esm5/observable/FromEventObservable.js"),
            "rxjs/observable/FromEventPatternObservable": path.resolve("./node_modules/rxjs/_esm5/observable/FromEventPatternObservable.js"),
            "rxjs/observable/FromObservable": path.resolve("./node_modules/rxjs/_esm5/observable/FromObservable.js"),
            "rxjs/observable/GenerateObservable": path.resolve("./node_modules/rxjs/_esm5/observable/GenerateObservable.js"),
            "rxjs/observable/IfObservable": path.resolve("./node_modules/rxjs/_esm5/observable/IfObservable.js"),
            "rxjs/observable/IntervalObservable": path.resolve("./node_modules/rxjs/_esm5/observable/IntervalObservable.js"),
            "rxjs/observable/IteratorObservable": path.resolve("./node_modules/rxjs/_esm5/observable/IteratorObservable.js"),
            "rxjs/observable/NeverObservable": path.resolve("./node_modules/rxjs/_esm5/observable/NeverObservable.js"),
            "rxjs/observable/PairsObservable": path.resolve("./node_modules/rxjs/_esm5/observable/PairsObservable.js"),
            "rxjs/observable/PromiseObservable": path.resolve("./node_modules/rxjs/_esm5/observable/PromiseObservable.js"),
            "rxjs/observable/RangeObservable": path.resolve("./node_modules/rxjs/_esm5/observable/RangeObservable.js"),
            "rxjs/observable/ScalarObservable": path.resolve("./node_modules/rxjs/_esm5/observable/ScalarObservable.js"),
            "rxjs/observable/SubscribeOnObservable": path.resolve("./node_modules/rxjs/_esm5/observable/SubscribeOnObservable.js"),
            "rxjs/observable/TimerObservable": path.resolve("./node_modules/rxjs/_esm5/observable/TimerObservable.js"),
            "rxjs/observable/UsingObservable": path.resolve("./node_modules/rxjs/_esm5/observable/UsingObservable.js"),
            "rxjs/observable/bindCallback": path.resolve("./node_modules/rxjs/_esm5/observable/bindCallback.js"),
            "rxjs/observable/bindNodeCallback": path.resolve("./node_modules/rxjs/_esm5/observable/bindNodeCallback.js"),
            "rxjs/observable/combineLatest": path.resolve("./node_modules/rxjs/_esm5/observable/combineLatest.js"),
            "rxjs/observable/concat": path.resolve("./node_modules/rxjs/_esm5/observable/concat.js"),
            "rxjs/observable/defer": path.resolve("./node_modules/rxjs/_esm5/observable/defer.js"),
            "rxjs/observable/dom/AjaxObservable": path.resolve("./node_modules/rxjs/_esm5/observable/dom/AjaxObservable.js"),
            "rxjs/observable/dom/WebSocketSubject": path.resolve("./node_modules/rxjs/_esm5/observable/dom/WebSocketSubject.js"),
            "rxjs/observable/dom/ajax": path.resolve("./node_modules/rxjs/_esm5/observable/dom/ajax.js"),
            "rxjs/observable/dom/webSocket": path.resolve("./node_modules/rxjs/_esm5/observable/dom/webSocket.js"),
            "rxjs/observable/empty": path.resolve("./node_modules/rxjs/_esm5/observable/empty.js"),
            "rxjs/observable/forkJoin": path.resolve("./node_modules/rxjs/_esm5/observable/forkJoin.js"),
            "rxjs/observable/from": path.resolve("./node_modules/rxjs/_esm5/observable/from.js"),
            "rxjs/observable/fromEvent": path.resolve("./node_modules/rxjs/_esm5/observable/fromEvent.js"),
            "rxjs/observable/fromEventPattern": path.resolve("./node_modules/rxjs/_esm5/observable/fromEventPattern.js"),
            "rxjs/observable/fromPromise": path.resolve("./node_modules/rxjs/_esm5/observable/fromPromise.js"),
            "rxjs/observable/generate": path.resolve("./node_modules/rxjs/_esm5/observable/generate.js"),
            "rxjs/observable/if": path.resolve("./node_modules/rxjs/_esm5/observable/if.js"),
            "rxjs/observable/interval": path.resolve("./node_modules/rxjs/_esm5/observable/interval.js"),
            "rxjs/observable/merge": path.resolve("./node_modules/rxjs/_esm5/observable/merge.js"),
            "rxjs/observable/never": path.resolve("./node_modules/rxjs/_esm5/observable/never.js"),
            "rxjs/observable/of": path.resolve("./node_modules/rxjs/_esm5/observable/of.js"),
            "rxjs/observable/onErrorResumeNext": path.resolve("./node_modules/rxjs/_esm5/observable/onErrorResumeNext.js"),
            "rxjs/observable/pairs": path.resolve("./node_modules/rxjs/_esm5/observable/pairs.js"),
            "rxjs/observable/race": path.resolve("./node_modules/rxjs/_esm5/observable/race.js"),
            "rxjs/observable/range": path.resolve("./node_modules/rxjs/_esm5/observable/range.js"),
            "rxjs/observable/throw": path.resolve("./node_modules/rxjs/_esm5/observable/throw.js"),
            "rxjs/observable/timer": path.resolve("./node_modules/rxjs/_esm5/observable/timer.js"),
            "rxjs/observable/using": path.resolve("./node_modules/rxjs/_esm5/observable/using.js"),
            "rxjs/observable/zip": path.resolve("./node_modules/rxjs/_esm5/observable/zip.js"),
            "rxjs/operator/audit": path.resolve("./node_modules/rxjs/_esm5/operator/audit.js"),
            "rxjs/operator/auditTime": path.resolve("./node_modules/rxjs/_esm5/operator/auditTime.js"),
            "rxjs/operator/buffer": path.resolve("./node_modules/rxjs/_esm5/operator/buffer.js"),
            "rxjs/operator/bufferCount": path.resolve("./node_modules/rxjs/_esm5/operator/bufferCount.js"),
            "rxjs/operator/bufferTime": path.resolve("./node_modules/rxjs/_esm5/operator/bufferTime.js"),
            "rxjs/operator/bufferToggle": path.resolve("./node_modules/rxjs/_esm5/operator/bufferToggle.js"),
            "rxjs/operator/bufferWhen": path.resolve("./node_modules/rxjs/_esm5/operator/bufferWhen.js"),
            "rxjs/operator/catch": path.resolve("./node_modules/rxjs/_esm5/operator/catch.js"),
            "rxjs/operator/combineAll": path.resolve("./node_modules/rxjs/_esm5/operator/combineAll.js"),
            "rxjs/operator/combineLatest": path.resolve("./node_modules/rxjs/_esm5/operator/combineLatest.js"),
            "rxjs/operator/concat": path.resolve("./node_modules/rxjs/_esm5/operator/concat.js"),
            "rxjs/operator/concatAll": path.resolve("./node_modules/rxjs/_esm5/operator/concatAll.js"),
            "rxjs/operator/concatMap": path.resolve("./node_modules/rxjs/_esm5/operator/concatMap.js"),
            "rxjs/operator/concatMapTo": path.resolve("./node_modules/rxjs/_esm5/operator/concatMapTo.js"),
            "rxjs/operator/count": path.resolve("./node_modules/rxjs/_esm5/operator/count.js"),
            "rxjs/operator/debounce": path.resolve("./node_modules/rxjs/_esm5/operator/debounce.js"),
            "rxjs/operator/debounceTime": path.resolve("./node_modules/rxjs/_esm5/operator/debounceTime.js"),
            "rxjs/operator/defaultIfEmpty": path.resolve("./node_modules/rxjs/_esm5/operator/defaultIfEmpty.js"),
            "rxjs/operator/delay": path.resolve("./node_modules/rxjs/_esm5/operator/delay.js"),
            "rxjs/operator/delayWhen": path.resolve("./node_modules/rxjs/_esm5/operator/delayWhen.js"),
            "rxjs/operator/dematerialize": path.resolve("./node_modules/rxjs/_esm5/operator/dematerialize.js"),
            "rxjs/operator/distinct": path.resolve("./node_modules/rxjs/_esm5/operator/distinct.js"),
            "rxjs/operator/distinctUntilChanged": path.resolve("./node_modules/rxjs/_esm5/operator/distinctUntilChanged.js"),
            "rxjs/operator/distinctUntilKeyChanged": path.resolve("./node_modules/rxjs/_esm5/operator/distinctUntilKeyChanged.js"),
            "rxjs/operator/do": path.resolve("./node_modules/rxjs/_esm5/operator/do.js"),
            "rxjs/operator/elementAt": path.resolve("./node_modules/rxjs/_esm5/operator/elementAt.js"),
            "rxjs/operator/every": path.resolve("./node_modules/rxjs/_esm5/operator/every.js"),
            "rxjs/operator/exhaust": path.resolve("./node_modules/rxjs/_esm5/operator/exhaust.js"),
            "rxjs/operator/exhaustMap": path.resolve("./node_modules/rxjs/_esm5/operator/exhaustMap.js"),
            "rxjs/operator/expand": path.resolve("./node_modules/rxjs/_esm5/operator/expand.js"),
            "rxjs/operator/filter": path.resolve("./node_modules/rxjs/_esm5/operator/filter.js"),
            "rxjs/operator/finally": path.resolve("./node_modules/rxjs/_esm5/operator/finally.js"),
            "rxjs/operator/find": path.resolve("./node_modules/rxjs/_esm5/operator/find.js"),
            "rxjs/operator/findIndex": path.resolve("./node_modules/rxjs/_esm5/operator/findIndex.js"),
            "rxjs/operator/first": path.resolve("./node_modules/rxjs/_esm5/operator/first.js"),
            "rxjs/operator/groupBy": path.resolve("./node_modules/rxjs/_esm5/operator/groupBy.js"),
            "rxjs/operator/ignoreElements": path.resolve("./node_modules/rxjs/_esm5/operator/ignoreElements.js"),
            "rxjs/operator/isEmpty": path.resolve("./node_modules/rxjs/_esm5/operator/isEmpty.js"),
            "rxjs/operator/last": path.resolve("./node_modules/rxjs/_esm5/operator/last.js"),
            "rxjs/operator/let": path.resolve("./node_modules/rxjs/_esm5/operator/let.js"),
            "rxjs/operator/map": path.resolve("./node_modules/rxjs/_esm5/operator/map.js"),
            "rxjs/operator/mapTo": path.resolve("./node_modules/rxjs/_esm5/operator/mapTo.js"),
            "rxjs/operator/materialize": path.resolve("./node_modules/rxjs/_esm5/operator/materialize.js"),
            "rxjs/operator/max": path.resolve("./node_modules/rxjs/_esm5/operator/max.js"),
            "rxjs/operator/merge": path.resolve("./node_modules/rxjs/_esm5/operator/merge.js"),
            "rxjs/operator/mergeAll": path.resolve("./node_modules/rxjs/_esm5/operator/mergeAll.js"),
            "rxjs/operator/mergeMap": path.resolve("./node_modules/rxjs/_esm5/operator/mergeMap.js"),
            "rxjs/operator/mergeMapTo": path.resolve("./node_modules/rxjs/_esm5/operator/mergeMapTo.js"),
            "rxjs/operator/mergeScan": path.resolve("./node_modules/rxjs/_esm5/operator/mergeScan.js"),
            "rxjs/operator/min": path.resolve("./node_modules/rxjs/_esm5/operator/min.js"),
            "rxjs/operator/multicast": path.resolve("./node_modules/rxjs/_esm5/operator/multicast.js"),
            "rxjs/operator/observeOn": path.resolve("./node_modules/rxjs/_esm5/operator/observeOn.js"),
            "rxjs/operator/onErrorResumeNext": path.resolve("./node_modules/rxjs/_esm5/operator/onErrorResumeNext.js"),
            "rxjs/operator/pairwise": path.resolve("./node_modules/rxjs/_esm5/operator/pairwise.js"),
            "rxjs/operator/partition": path.resolve("./node_modules/rxjs/_esm5/operator/partition.js"),
            "rxjs/operator/pluck": path.resolve("./node_modules/rxjs/_esm5/operator/pluck.js"),
            "rxjs/operator/publish": path.resolve("./node_modules/rxjs/_esm5/operator/publish.js"),
            "rxjs/operator/publishBehavior": path.resolve("./node_modules/rxjs/_esm5/operator/publishBehavior.js"),
            "rxjs/operator/publishLast": path.resolve("./node_modules/rxjs/_esm5/operator/publishLast.js"),
            "rxjs/operator/publishReplay": path.resolve("./node_modules/rxjs/_esm5/operator/publishReplay.js"),
            "rxjs/operator/race": path.resolve("./node_modules/rxjs/_esm5/operator/race.js"),
            "rxjs/operator/reduce": path.resolve("./node_modules/rxjs/_esm5/operator/reduce.js"),
            "rxjs/operator/repeat": path.resolve("./node_modules/rxjs/_esm5/operator/repeat.js"),
            "rxjs/operator/repeatWhen": path.resolve("./node_modules/rxjs/_esm5/operator/repeatWhen.js"),
            "rxjs/operator/retry": path.resolve("./node_modules/rxjs/_esm5/operator/retry.js"),
            "rxjs/operator/retryWhen": path.resolve("./node_modules/rxjs/_esm5/operator/retryWhen.js"),
            "rxjs/operator/sample": path.resolve("./node_modules/rxjs/_esm5/operator/sample.js"),
            "rxjs/operator/sampleTime": path.resolve("./node_modules/rxjs/_esm5/operator/sampleTime.js"),
            "rxjs/operator/scan": path.resolve("./node_modules/rxjs/_esm5/operator/scan.js"),
            "rxjs/operator/sequenceEqual": path.resolve("./node_modules/rxjs/_esm5/operator/sequenceEqual.js"),
            "rxjs/operator/share": path.resolve("./node_modules/rxjs/_esm5/operator/share.js"),
            "rxjs/operator/shareReplay": path.resolve("./node_modules/rxjs/_esm5/operator/shareReplay.js"),
            "rxjs/operator/single": path.resolve("./node_modules/rxjs/_esm5/operator/single.js"),
            "rxjs/operator/skip": path.resolve("./node_modules/rxjs/_esm5/operator/skip.js"),
            "rxjs/operator/skipLast": path.resolve("./node_modules/rxjs/_esm5/operator/skipLast.js"),
            "rxjs/operator/skipUntil": path.resolve("./node_modules/rxjs/_esm5/operator/skipUntil.js"),
            "rxjs/operator/skipWhile": path.resolve("./node_modules/rxjs/_esm5/operator/skipWhile.js"),
            "rxjs/operator/startWith": path.resolve("./node_modules/rxjs/_esm5/operator/startWith.js"),
            "rxjs/operator/subscribeOn": path.resolve("./node_modules/rxjs/_esm5/operator/subscribeOn.js"),
            "rxjs/operator/switch": path.resolve("./node_modules/rxjs/_esm5/operator/switch.js"),
            "rxjs/operator/switchMap": path.resolve("./node_modules/rxjs/_esm5/operator/switchMap.js"),
            "rxjs/operator/switchMapTo": path.resolve("./node_modules/rxjs/_esm5/operator/switchMapTo.js"),
            "rxjs/operator/take": path.resolve("./node_modules/rxjs/_esm5/operator/take.js"),
            "rxjs/operator/takeLast": path.resolve("./node_modules/rxjs/_esm5/operator/takeLast.js"),
            "rxjs/operator/takeUntil": path.resolve("./node_modules/rxjs/_esm5/operator/takeUntil.js"),
            "rxjs/operator/takeWhile": path.resolve("./node_modules/rxjs/_esm5/operator/takeWhile.js"),
            "rxjs/operator/throttle": path.resolve("./node_modules/rxjs/_esm5/operator/throttle.js"),
            "rxjs/operator/throttleTime": path.resolve("./node_modules/rxjs/_esm5/operator/throttleTime.js"),
            "rxjs/operator/timeInterval": path.resolve("./node_modules/rxjs/_esm5/operator/timeInterval.js"),
            "rxjs/operator/timeout": path.resolve("./node_modules/rxjs/_esm5/operator/timeout.js"),
            "rxjs/operator/timeoutWith": path.resolve("./node_modules/rxjs/_esm5/operator/timeoutWith.js"),
            "rxjs/operator/timestamp": path.resolve("./node_modules/rxjs/_esm5/operator/timestamp.js"),
            "rxjs/operator/toArray": path.resolve("./node_modules/rxjs/_esm5/operator/toArray.js"),
            "rxjs/operator/toPromise": path.resolve("./node_modules/rxjs/_esm5/operator/toPromise.js"),
            "rxjs/operator/window": path.resolve("./node_modules/rxjs/_esm5/operator/window.js"),
            "rxjs/operator/windowCount": path.resolve("./node_modules/rxjs/_esm5/operator/windowCount.js"),
            "rxjs/operator/windowTime": path.resolve("./node_modules/rxjs/_esm5/operator/windowTime.js"),
            "rxjs/operator/windowToggle": path.resolve("./node_modules/rxjs/_esm5/operator/windowToggle.js"),
            "rxjs/operator/windowWhen": path.resolve("./node_modules/rxjs/_esm5/operator/windowWhen.js"),
            "rxjs/operator/withLatestFrom": path.resolve("./node_modules/rxjs/_esm5/operator/withLatestFrom.js"),
            "rxjs/operator/zip": path.resolve("./node_modules/rxjs/_esm5/operator/zip.js"),
            "rxjs/operator/zipAll": path.resolve("./node_modules/rxjs/_esm5/operator/zipAll.js"),
            "rxjs/operators/audit": path.resolve("./node_modules/rxjs/_esm5/operators/audit.js"),
            "rxjs/operators/auditTime": path.resolve("./node_modules/rxjs/_esm5/operators/auditTime.js"),
            "rxjs/operators/buffer": path.resolve("./node_modules/rxjs/_esm5/operators/buffer.js"),
            "rxjs/operators/bufferCount": path.resolve("./node_modules/rxjs/_esm5/operators/bufferCount.js"),
            "rxjs/operators/bufferTime": path.resolve("./node_modules/rxjs/_esm5/operators/bufferTime.js"),
            "rxjs/operators/bufferToggle": path.resolve("./node_modules/rxjs/_esm5/operators/bufferToggle.js"),
            "rxjs/operators/bufferWhen": path.resolve("./node_modules/rxjs/_esm5/operators/bufferWhen.js"),
            "rxjs/operators/catchError": path.resolve("./node_modules/rxjs/_esm5/operators/catchError.js"),
            "rxjs/operators/combineAll": path.resolve("./node_modules/rxjs/_esm5/operators/combineAll.js"),
            "rxjs/operators/combineLatest": path.resolve("./node_modules/rxjs/_esm5/operators/combineLatest.js"),
            "rxjs/operators/concat": path.resolve("./node_modules/rxjs/_esm5/operators/concat.js"),
            "rxjs/operators/concatAll": path.resolve("./node_modules/rxjs/_esm5/operators/concatAll.js"),
            "rxjs/operators/concatMap": path.resolve("./node_modules/rxjs/_esm5/operators/concatMap.js"),
            "rxjs/operators/concatMapTo": path.resolve("./node_modules/rxjs/_esm5/operators/concatMapTo.js"),
            "rxjs/operators/count": path.resolve("./node_modules/rxjs/_esm5/operators/count.js"),
            "rxjs/operators/debounce": path.resolve("./node_modules/rxjs/_esm5/operators/debounce.js"),
            "rxjs/operators/debounceTime": path.resolve("./node_modules/rxjs/_esm5/operators/debounceTime.js"),
            "rxjs/operators/defaultIfEmpty": path.resolve("./node_modules/rxjs/_esm5/operators/defaultIfEmpty.js"),
            "rxjs/operators/delay": path.resolve("./node_modules/rxjs/_esm5/operators/delay.js"),
            "rxjs/operators/delayWhen": path.resolve("./node_modules/rxjs/_esm5/operators/delayWhen.js"),
            "rxjs/operators/dematerialize": path.resolve("./node_modules/rxjs/_esm5/operators/dematerialize.js"),
            "rxjs/operators/distinct": path.resolve("./node_modules/rxjs/_esm5/operators/distinct.js"),
            "rxjs/operators/distinctUntilChanged": path.resolve("./node_modules/rxjs/_esm5/operators/distinctUntilChanged.js"),
            "rxjs/operators/distinctUntilKeyChanged": path.resolve("./node_modules/rxjs/_esm5/operators/distinctUntilKeyChanged.js"),
            "rxjs/operators/elementAt": path.resolve("./node_modules/rxjs/_esm5/operators/elementAt.js"),
            "rxjs/operators/every": path.resolve("./node_modules/rxjs/_esm5/operators/every.js"),
            "rxjs/operators/exhaust": path.resolve("./node_modules/rxjs/_esm5/operators/exhaust.js"),
            "rxjs/operators/exhaustMap": path.resolve("./node_modules/rxjs/_esm5/operators/exhaustMap.js"),
            "rxjs/operators/expand": path.resolve("./node_modules/rxjs/_esm5/operators/expand.js"),
            "rxjs/operators/filter": path.resolve("./node_modules/rxjs/_esm5/operators/filter.js"),
            "rxjs/operators/finalize": path.resolve("./node_modules/rxjs/_esm5/operators/finalize.js"),
            "rxjs/operators/find": path.resolve("./node_modules/rxjs/_esm5/operators/find.js"),
            "rxjs/operators/findIndex": path.resolve("./node_modules/rxjs/_esm5/operators/findIndex.js"),
            "rxjs/operators/first": path.resolve("./node_modules/rxjs/_esm5/operators/first.js"),
            "rxjs/operators/groupBy": path.resolve("./node_modules/rxjs/_esm5/operators/groupBy.js"),
            "rxjs/operators/ignoreElements": path.resolve("./node_modules/rxjs/_esm5/operators/ignoreElements.js"),
            "rxjs/operators/index": path.resolve("./node_modules/rxjs/_esm5/operators/index.js"),
            "rxjs/operators/isEmpty": path.resolve("./node_modules/rxjs/_esm5/operators/isEmpty.js"),
            "rxjs/operators/last": path.resolve("./node_modules/rxjs/_esm5/operators/last.js"),
            "rxjs/operators/map": path.resolve("./node_modules/rxjs/_esm5/operators/map.js"),
            "rxjs/operators/mapTo": path.resolve("./node_modules/rxjs/_esm5/operators/mapTo.js"),
            "rxjs/operators/materialize": path.resolve("./node_modules/rxjs/_esm5/operators/materialize.js"),
            "rxjs/operators/max": path.resolve("./node_modules/rxjs/_esm5/operators/max.js"),
            "rxjs/operators/merge": path.resolve("./node_modules/rxjs/_esm5/operators/merge.js"),
            "rxjs/operators/mergeAll": path.resolve("./node_modules/rxjs/_esm5/operators/mergeAll.js"),
            "rxjs/operators/mergeMap": path.resolve("./node_modules/rxjs/_esm5/operators/mergeMap.js"),
            "rxjs/operators/mergeMapTo": path.resolve("./node_modules/rxjs/_esm5/operators/mergeMapTo.js"),
            "rxjs/operators/mergeScan": path.resolve("./node_modules/rxjs/_esm5/operators/mergeScan.js"),
            "rxjs/operators/min": path.resolve("./node_modules/rxjs/_esm5/operators/min.js"),
            "rxjs/operators/multicast": path.resolve("./node_modules/rxjs/_esm5/operators/multicast.js"),
            "rxjs/operators/observeOn": path.resolve("./node_modules/rxjs/_esm5/operators/observeOn.js"),
            "rxjs/operators/onErrorResumeNext": path.resolve("./node_modules/rxjs/_esm5/operators/onErrorResumeNext.js"),
            "rxjs/operators/pairwise": path.resolve("./node_modules/rxjs/_esm5/operators/pairwise.js"),
            "rxjs/operators/partition": path.resolve("./node_modules/rxjs/_esm5/operators/partition.js"),
            "rxjs/operators/pluck": path.resolve("./node_modules/rxjs/_esm5/operators/pluck.js"),
            "rxjs/operators/publish": path.resolve("./node_modules/rxjs/_esm5/operators/publish.js"),
            "rxjs/operators/publishBehavior": path.resolve("./node_modules/rxjs/_esm5/operators/publishBehavior.js"),
            "rxjs/operators/publishLast": path.resolve("./node_modules/rxjs/_esm5/operators/publishLast.js"),
            "rxjs/operators/publishReplay": path.resolve("./node_modules/rxjs/_esm5/operators/publishReplay.js"),
            "rxjs/operators/race": path.resolve("./node_modules/rxjs/_esm5/operators/race.js"),
            "rxjs/operators/reduce": path.resolve("./node_modules/rxjs/_esm5/operators/reduce.js"),
            "rxjs/operators/refCount": path.resolve("./node_modules/rxjs/_esm5/operators/refCount.js"),
            "rxjs/operators/repeat": path.resolve("./node_modules/rxjs/_esm5/operators/repeat.js"),
            "rxjs/operators/repeatWhen": path.resolve("./node_modules/rxjs/_esm5/operators/repeatWhen.js"),
            "rxjs/operators/retry": path.resolve("./node_modules/rxjs/_esm5/operators/retry.js"),
            "rxjs/operators/retryWhen": path.resolve("./node_modules/rxjs/_esm5/operators/retryWhen.js"),
            "rxjs/operators/sample": path.resolve("./node_modules/rxjs/_esm5/operators/sample.js"),
            "rxjs/operators/sampleTime": path.resolve("./node_modules/rxjs/_esm5/operators/sampleTime.js"),
            "rxjs/operators/scan": path.resolve("./node_modules/rxjs/_esm5/operators/scan.js"),
            "rxjs/operators/sequenceEqual": path.resolve("./node_modules/rxjs/_esm5/operators/sequenceEqual.js"),
            "rxjs/operators/share": path.resolve("./node_modules/rxjs/_esm5/operators/share.js"),
            "rxjs/operators/shareReplay": path.resolve("./node_modules/rxjs/_esm5/operators/shareReplay.js"),
            "rxjs/operators/single": path.resolve("./node_modules/rxjs/_esm5/operators/single.js"),
            "rxjs/operators/skip": path.resolve("./node_modules/rxjs/_esm5/operators/skip.js"),
            "rxjs/operators/skipLast": path.resolve("./node_modules/rxjs/_esm5/operators/skipLast.js"),
            "rxjs/operators/skipUntil": path.resolve("./node_modules/rxjs/_esm5/operators/skipUntil.js"),
            "rxjs/operators/skipWhile": path.resolve("./node_modules/rxjs/_esm5/operators/skipWhile.js"),
            "rxjs/operators/startWith": path.resolve("./node_modules/rxjs/_esm5/operators/startWith.js"),
            "rxjs/operators/subscribeOn": path.resolve("./node_modules/rxjs/_esm5/operators/subscribeOn.js"),
            "rxjs/operators/switchAll": path.resolve("./node_modules/rxjs/_esm5/operators/switchAll.js"),
            "rxjs/operators/switchMap": path.resolve("./node_modules/rxjs/_esm5/operators/switchMap.js"),
            "rxjs/operators/switchMapTo": path.resolve("./node_modules/rxjs/_esm5/operators/switchMapTo.js"),
            "rxjs/operators/take": path.resolve("./node_modules/rxjs/_esm5/operators/take.js"),
            "rxjs/operators/takeLast": path.resolve("./node_modules/rxjs/_esm5/operators/takeLast.js"),
            "rxjs/operators/takeUntil": path.resolve("./node_modules/rxjs/_esm5/operators/takeUntil.js"),
            "rxjs/operators/takeWhile": path.resolve("./node_modules/rxjs/_esm5/operators/takeWhile.js"),
            "rxjs/operators/tap": path.resolve("./node_modules/rxjs/_esm5/operators/tap.js"),
            "rxjs/operators/throttle": path.resolve("./node_modules/rxjs/_esm5/operators/throttle.js"),
            "rxjs/operators/throttleTime": path.resolve("./node_modules/rxjs/_esm5/operators/throttleTime.js"),
            "rxjs/operators/timeInterval": path.resolve("./node_modules/rxjs/_esm5/operators/timeInterval.js"),
            "rxjs/operators/timeout": path.resolve("./node_modules/rxjs/_esm5/operators/timeout.js"),
            "rxjs/operators/timeoutWith": path.resolve("./node_modules/rxjs/_esm5/operators/timeoutWith.js"),
            "rxjs/operators/timestamp": path.resolve("./node_modules/rxjs/_esm5/operators/timestamp.js"),
            "rxjs/operators/toArray": path.resolve("./node_modules/rxjs/_esm5/operators/toArray.js"),
            "rxjs/operators/window": path.resolve("./node_modules/rxjs/_esm5/operators/window.js"),
            "rxjs/operators/windowCount": path.resolve("./node_modules/rxjs/_esm5/operators/windowCount.js"),
            "rxjs/operators/windowTime": path.resolve("./node_modules/rxjs/_esm5/operators/windowTime.js"),
            "rxjs/operators/windowToggle": path.resolve("./node_modules/rxjs/_esm5/operators/windowToggle.js"),
            "rxjs/operators/windowWhen": path.resolve("./node_modules/rxjs/_esm5/operators/windowWhen.js"),
            "rxjs/operators/withLatestFrom": path.resolve("./node_modules/rxjs/_esm5/operators/withLatestFrom.js"),
            "rxjs/operators/zip": path.resolve("./node_modules/rxjs/_esm5/operators/zip.js"),
            "rxjs/operators/zipAll": path.resolve("./node_modules/rxjs/_esm5/operators/zipAll.js"),
            "rxjs/scheduler/Action": path.resolve("./node_modules/rxjs/_esm5/scheduler/Action.js"),
            "rxjs/scheduler/AnimationFrameAction": path.resolve("./node_modules/rxjs/_esm5/scheduler/AnimationFrameAction.js"),
            "rxjs/scheduler/AnimationFrameScheduler": path.resolve("./node_modules/rxjs/_esm5/scheduler/AnimationFrameScheduler.js"),
            "rxjs/scheduler/AsapAction": path.resolve("./node_modules/rxjs/_esm5/scheduler/AsapAction.js"),
            "rxjs/scheduler/AsapScheduler": path.resolve("./node_modules/rxjs/_esm5/scheduler/AsapScheduler.js"),
            "rxjs/scheduler/AsyncAction": path.resolve("./node_modules/rxjs/_esm5/scheduler/AsyncAction.js"),
            "rxjs/scheduler/AsyncScheduler": path.resolve("./node_modules/rxjs/_esm5/scheduler/AsyncScheduler.js"),
            "rxjs/scheduler/QueueAction": path.resolve("./node_modules/rxjs/_esm5/scheduler/QueueAction.js"),
            "rxjs/scheduler/QueueScheduler": path.resolve("./node_modules/rxjs/_esm5/scheduler/QueueScheduler.js"),
            "rxjs/scheduler/VirtualTimeScheduler": path.resolve("./node_modules/rxjs/_esm5/scheduler/VirtualTimeScheduler.js"),
            "rxjs/scheduler/animationFrame": path.resolve("./node_modules/rxjs/_esm5/scheduler/animationFrame.js"),
            "rxjs/scheduler/asap": path.resolve("./node_modules/rxjs/_esm5/scheduler/asap.js"),
            "rxjs/scheduler/async": path.resolve("./node_modules/rxjs/_esm5/scheduler/async.js"),
            "rxjs/scheduler/queue": path.resolve("./node_modules/rxjs/_esm5/scheduler/queue.js"),
            "rxjs/symbol/iterator": path.resolve("./node_modules/rxjs/_esm5/symbol/iterator.js"),
            "rxjs/symbol/observable": path.resolve("./node_modules/rxjs/_esm5/symbol/observable.js"),
            "rxjs/symbol/rxSubscriber": path.resolve("./node_modules/rxjs/_esm5/symbol/rxSubscriber.js"),
            "rxjs/testing/ColdObservable": path.resolve("./node_modules/rxjs/_esm5/testing/ColdObservable.js"),
            "rxjs/testing/HotObservable": path.resolve("./node_modules/rxjs/_esm5/testing/HotObservable.js"),
            "rxjs/testing/SubscriptionLog": path.resolve("./node_modules/rxjs/_esm5/testing/SubscriptionLog.js"),
            "rxjs/testing/SubscriptionLoggable": path.resolve("./node_modules/rxjs/_esm5/testing/SubscriptionLoggable.js"),
            "rxjs/testing/TestMessage": path.resolve("./node_modules/rxjs/_esm5/testing/TestMessage.js"),
            "rxjs/testing/TestScheduler": path.resolve("./node_modules/rxjs/_esm5/testing/TestScheduler.js"),
            "rxjs/util/AnimationFrame": path.resolve("./node_modules/rxjs/_esm5/util/AnimationFrame.js"),
            "rxjs/util/ArgumentOutOfRangeError": path.resolve("./node_modules/rxjs/_esm5/util/ArgumentOutOfRangeError.js"),
            "rxjs/util/EmptyError": path.resolve("./node_modules/rxjs/_esm5/util/EmptyError.js"),
            "rxjs/util/FastMap": path.resolve("./node_modules/rxjs/_esm5/util/FastMap.js"),
            "rxjs/util/Immediate": path.resolve("./node_modules/rxjs/_esm5/util/Immediate.js"),
            "rxjs/util/Map": path.resolve("./node_modules/rxjs/_esm5/util/Map.js"),
            "rxjs/util/MapPolyfill": path.resolve("./node_modules/rxjs/_esm5/util/MapPolyfill.js"),
            "rxjs/util/ObjectUnsubscribedError": path.resolve("./node_modules/rxjs/_esm5/util/ObjectUnsubscribedError.js"),
            "rxjs/util/Set": path.resolve("./node_modules/rxjs/_esm5/util/Set.js"),
            "rxjs/util/TimeoutError": path.resolve("./node_modules/rxjs/_esm5/util/TimeoutError.js"),
            "rxjs/util/UnsubscriptionError": path.resolve("./node_modules/rxjs/_esm5/util/UnsubscriptionError.js"),
            "rxjs/util/applyMixins": path.resolve("./node_modules/rxjs/_esm5/util/applyMixins.js"),
            "rxjs/util/assign": path.resolve("./node_modules/rxjs/_esm5/util/assign.js"),
            "rxjs/util/errorObject": path.resolve("./node_modules/rxjs/_esm5/util/errorObject.js"),
            "rxjs/util/identity": path.resolve("./node_modules/rxjs/_esm5/util/identity.js"),
            "rxjs/util/isArray": path.resolve("./node_modules/rxjs/_esm5/util/isArray.js"),
            "rxjs/util/isArrayLike": path.resolve("./node_modules/rxjs/_esm5/util/isArrayLike.js"),
            "rxjs/util/isDate": path.resolve("./node_modules/rxjs/_esm5/util/isDate.js"),
            "rxjs/util/isFunction": path.resolve("./node_modules/rxjs/_esm5/util/isFunction.js"),
            "rxjs/util/isNumeric": path.resolve("./node_modules/rxjs/_esm5/util/isNumeric.js"),
            "rxjs/util/isObject": path.resolve("./node_modules/rxjs/_esm5/util/isObject.js"),
            "rxjs/util/isPromise": path.resolve("./node_modules/rxjs/_esm5/util/isPromise.js"),
            "rxjs/util/isScheduler": path.resolve("./node_modules/rxjs/_esm5/util/isScheduler.js"),
            "rxjs/util/noop": path.resolve("./node_modules/rxjs/_esm5/util/noop.js"),
            "rxjs/util/not": path.resolve("./node_modules/rxjs/_esm5/util/not.js"),
            "rxjs/util/pipe": path.resolve("./node_modules/rxjs/_esm5/util/pipe.js"),
            "rxjs/util/root": path.resolve("./node_modules/rxjs/_esm5/util/root.js"),
            "rxjs/util/subscribeToResult": path.resolve("./node_modules/rxjs/_esm5/util/subscribeToResult.js"),
            "rxjs/util/toSubscriber": path.resolve("./node_modules/rxjs/_esm5/util/toSubscriber.js"),
            "rxjs/util/tryCatch": path.resolve("./node_modules/rxjs/_esm5/util/tryCatch.js"),
            "rxjs/operators": path.resolve("./node_modules/rxjs/_esm5/operators/index.js")
        },
        "mainFields": [
            "browser",
            "module",
            "main"
        ]
    },
    "resolveLoader": {
        "modules": [
            "./node_modules"
        ]
    },
    "entry": {
        "main": [
            "./src/main.ts"
        ],
        "polyfills": [
            "./src/polyfills.ts"
        ],
        "styles": [
            "./src/styles.css"
        ]
    },
    "output": {
        "path": path.join(process.cwd(), "www"),
        "filename": "[name].bundle.js",
        "chunkFilename": "[id].chunk.js",
        "crossOriginLoading": false
    },
    "module": {
        "rules": [
            {
                "test": /\.html$/,
                "loader": "raw-loader"
            },
            {
                "test": /\.(eot|svg|cur)$/,
                "loader": "file-loader",
                "options": {
                    "name": "[name].[hash:20].[ext]",
                    "limit": 10000
                }
            },
            {
                "test": /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
                "loader": "url-loader",
                "options": {
                    "name": "[name].[hash:20].[ext]",
                    "limit": 10000
                }
            },
            {
                "exclude": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.css$/,
                "use": [
                    "exports-loader?module.exports.toString()",
                    {
                        "loader": "css-loader",
                        "options": {
                            "sourceMap": false,
                            "importLoaders": 1
                        }
                    },
                    {
                        "loader": "postcss-loader",
                        "options": {
                            "ident": "postcss",
                            "plugins": postcssPlugins
                        }
                    }
                ]
            },
            {
                "exclude": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.scss$|\.sass$/,
                "use": [
                    "exports-loader?module.exports.toString()",
                    {
                        "loader": "css-loader",
                        "options": {
                            "sourceMap": false,
                            "importLoaders": 1
                        }
                    },
                    {
                        "loader": "postcss-loader",
                        "options": {
                            "ident": "postcss",
                            "plugins": postcssPlugins
                        }
                    },
                    {
                        "loader": "sass-loader",
                        "options": {
                            "sourceMap": false,
                            "precision": 8,
                            "includePaths": []
                        }
                    }
                ]
            },
            {
                "exclude": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.less$/,
                "use": [
                    "exports-loader?module.exports.toString()",
                    {
                        "loader": "css-loader",
                        "options": {
                            "sourceMap": false,
                            "importLoaders": 1
                        }
                    },
                    {
                        "loader": "postcss-loader",
                        "options": {
                            "ident": "postcss",
                            "plugins": postcssPlugins
                        }
                    },
                    {
                        "loader": "less-loader",
                        "options": {
                            "sourceMap": false
                        }
                    }
                ]
            },
            {
                "exclude": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.styl$/,
                "use": [
                    "exports-loader?module.exports.toString()",
                    {
                        "loader": "css-loader",
                        "options": {
                            "sourceMap": false,
                            "importLoaders": 1
                        }
                    },
                    {
                        "loader": "postcss-loader",
                        "options": {
                            "ident": "postcss",
                            "plugins": postcssPlugins
                        }
                    },
                    {
                        "loader": "stylus-loader",
                        "options": {
                            "sourceMap": false,
                            "paths": []
                        }
                    }
                ]
            },
            {
                "include": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.css$/,
                "use": [
                    "style-loader",
                    {
                        "loader": "css-loader",
                        "options": {
                            "sourceMap": false,
                            "importLoaders": 1
                        }
                    },
                    {
                        "loader": "postcss-loader",
                        "options": {
                            "ident": "postcss",
                            "plugins": postcssPlugins
                        }
                    }
                ]
            },
            {
                "include": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.scss$|\.sass$/,
                "use": [
                    "style-loader",
                    {
                        "loader": "css-loader",
                        "options": {
                            "sourceMap": false,
                            "importLoaders": 1
                        }
                    },
                    {
                        "loader": "postcss-loader",
                        "options": {
                            "ident": "postcss",
                            "plugins": postcssPlugins
                        }
                    },
                    {
                        "loader": "sass-loader",
                        "options": {
                            "sourceMap": false,
                            "precision": 8,
                            "includePaths": []
                        }
                    }
                ]
            },
            {
                "include": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.less$/,
                "use": [
                    "style-loader",
                    {
                        "loader": "css-loader",
                        "options": {
                            "sourceMap": false,
                            "importLoaders": 1
                        }
                    },
                    {
                        "loader": "postcss-loader",
                        "options": {
                            "ident": "postcss",
                            "plugins": postcssPlugins
                        }
                    },
                    {
                        "loader": "less-loader",
                        "options": {
                            "sourceMap": false
                        }
                    }
                ]
            },
            {
                "include": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.styl$/,
                "use": [
                    "style-loader",
                    {
                        "loader": "css-loader",
                        "options": {
                            "sourceMap": false,
                            "importLoaders": 1
                        }
                    },
                    {
                        "loader": "postcss-loader",
                        "options": {
                            "ident": "postcss",
                            "plugins": postcssPlugins
                        }
                    },
                    {
                        "loader": "stylus-loader",
                        "options": {
                            "sourceMap": false,
                            "paths": []
                        }
                    }
                ]
            },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                "test": /\.pug$/,
                "loader": 'pug-ng-html-loader'
            }
        ]
    },
    "plugins": [
        new NoEmitOnErrorsPlugin(),
        new CopyWebpackPlugin([
            {
                "context": "src",
                "to": "",
                "from": {
                    "glob": "assets/**/*",
                    "dot": true
                }
            },
            {
                "context": "src",
                "to": "",
                "from": {
                    "glob": "favicon.ico",
                    "dot": true
                }
            }
        ], {
            "ignore": [
                ".gitkeep"
            ],
            "debug": "warning"
        }),
        new ProgressPlugin(),
        new CircularDependencyPlugin({
            "exclude": /(\\|\/)node_modules(\\|\/)/,
            "failOnError": false
        }),
        new NamedLazyChunksWebpackPlugin(),
        new HtmlWebpackPlugin({
            "template": process.env.NODE_ENV !== 'production' ? "./src/index.html" : "./src/index-cordova.html",
            "filename": "./index.html",
            "hash": false,
            "inject": true,
            "compile": true,
            "favicon": false,
            "minify": process.env.NODE_ENV !== 'production' ? false : {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                html5: true,
                minifyCSS: true,
                removeComments: true,
                removeEmptyAttributes: true,
            },
            "cache": true,
            "showErrors": true,
            "chunks": "all",
            "excludeChunks": [],
            "title": "Webpack App",
            "xhtml": true,
            "chunksSortMode": function sort(left, right) {
                let leftIndex = entryPoints.indexOf(left.names[0]);
                let rightindex = entryPoints.indexOf(right.names[0]);
                if (leftIndex > rightindex) {
                    return 1;
                }
                else if (leftIndex < rightindex) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
        }),
        new BaseHrefWebpackPlugin({}),
        new CommonsChunkPlugin({
            "name": [
                "inline"
            ],
            "minChunks": null
        }),
        new CommonsChunkPlugin({
            "name": [
                "vendor"
            ],
            "minChunks": (module) => {
                return module.resource
                    && (module.resource.startsWith(nodeModules)
                        || module.resource.startsWith(genDirNodeModules)
                        || module.resource.startsWith(realNodeModules));
            },
            "chunks": [
                "main"
            ]
        }),
        new SourceMapDevToolPlugin({
            "filename": "[file].map[query]",
            "moduleFilenameTemplate": "[resource-path]",
            "fallbackModuleFilenameTemplate": "[resource-path]?[hash]",
            "sourceRoot": "webpack:///"
        }),
        new CommonsChunkPlugin({
            "name": [
                "main"
            ],
            "minChunks": 2,
            "async": "common"
        }),
        new NamedModulesPlugin({}),
        new AngularCompilerPlugin({
            "mainPath": "main.ts",
            "platform": 0,
            "hostReplacementPaths": {
                "environments/environment.ts": environmentFiles[NODE_ENV]
            },
            // "i18nFile": "src/i18n/translations.en-US.xlf",
            // "i18nFormat": "xlf",
            // "locale": "en-US",
            "replaceExport": false,
            "missingTranslation": "error",
            "sourceMap": true,
            "tsConfigPath": "src/tsconfig.app.json",
            "skipCodeGeneration": process.env.NODE_ENV !== 'production',
            "compilerOptions": {}
        }),
        // new ExtractI18nPlugin({
        //     "tsConfigPath": "app/tsconfig.app.json",
        //     "exclude": [],
        //     "i18nFormat": "xlf",
        //     "locale": "en-US",
        //     "outFile": "translations.xlf",
        //     "genDir": "app/i18n/"
        // })
    ],
    "node": {
        "fs": "empty",
        "global": true,
        "crypto": "empty",
        "tls": "empty",
        "net": "empty",
        "process": true,
        "module": false,
        "clearImmediate": false,
        "setImmediate": false
    },
    "devServer": {
        "historyApiFallback": true
    }
};
