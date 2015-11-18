/**
 * Created by alei on 2015/10/15.
 * require
 */
(function (S, underfine) {
    var _ = S.lodash,
        Config = S.Config,
        configFns = Config.fns,
        baseurl = S.base.path,
        RemoveJsExtFromName = S.addIndexAndRemoveJsExtFromName,
        guid = 1;

    //所有add模块的依赖和方法存储
    var moduleCache = {},//模块方法依赖关系缓存
        useModule = {},
        loadedModule = {};//所有模块

    var createScript = function (filepath) {
        if (loadedModule[filepath]['status'] == 0) {
            var W3C = document.dispatchEvent; //w3c事件模型
            var oHead = document.getElementsByTagName('HEAD').item(0);
            var oScript = document.createElement("script");
            oScript.type = "text/javascript";
            oScript.src = S.getBasePath() + RemoveJsExtFromName(filepath) + ".js?t=" + new Date().valueOf();
            oHead.appendChild(oScript);
            oScript[W3C ? "onload" : "onreadystatechange"] = function () {
                if (W3C || /loaded|complete/i.test(oScript.readyState)) {
                    checkFail();
                }
            };
        }
    };

    //检测Notloadmodule 未加载完成模块
    function checkFail() {
        var loading = _.min(loadedModule, 'status');
        if (loading.status == 1) {
            _.forEach(useModule, function (usemod, key) {
                eval('('+combineReqs(key, useModule[key].reqs)+')');
            });
        }

    }

    //递归组装use 引用模块和所有依赖的
    var temp = "";

    function combineReqs(key, arrs) {
        if (arrs.length > 0) {
            var arr = [];
            _.each(arrs, function (s) {
                arr.push(combineReqs(s, moduleCache[s].reqs));
                combineReqs(s, moduleCache[s].reqs);
            });
            temp = 'moduleCache["' + key + '"].fn(S,' + arr.join(',') + ')';
            return temp;
        } else {
            temp = 'moduleCache["' + key + '"].fn(S)';
            return temp;
        }
    }

    //add 方式模块加载依赖的js，缓存方法并不执行直到use
    var addRequires = function (modName, func, requires) {
        var reqs = requires || [];
        moduleCache[modName] = {reqs: reqs, fn: func};
        loadedModule[modName] = {
            "src": S.getBasePath() + modName, //用户测试打印路径
            "status": 1
        };
        //modName 已加载
        _.each(reqs, function (mod) {
            if (!loadedModule[mod]) {
                loadedModule[mod] = {
                    "status": 0
                };// 等待加载...的模块
                createScript(mod);
            }
        });
    };
    //add 模块加载完毕后并

    //use 方式加载依赖的js
    var useRequires = function (reqs, func) {
        moduleCache[guid] = useModule[guid] = {
            reqs: reqs,
            fn: func
        };
        _.each(reqs, function (mod) {
            if (!loadedModule[mod]) {
                loadedModule[mod] = {
                    "status": 0
                };// 等待加载...的模块
            }
            createScript(mod);
        });
        guid++;
    };

    _.mixin(S, {
        add: function () {
            var arg = arguments,
                len = arg.length,
                reqs = [];
            reqs = arg[2] && arg[2].requires;
            if (len == 3 && _.isObject(arg[2])) {
                addRequires(arg[0], arg[1], reqs);
            } else {
                addRequires(arg[0], arg[1]);
            }
        },
        use: function () {
            var arg = arguments,
                len = arg.length,
                reqs = [];
            if (_.isFunction(arg[0])) {
                arg[len - 1](S);
            }
            if (_.isArray(arg[0])) {
                reqs = arg[0];
                useRequires(reqs, arg[1]);
            }
            if (_.isString(arg[0]) && _.isFunction(arg[len - 1])) {
                reqs = Array.prototype.slice.apply(arguments, [0, len - 1]);
                useRequires(reqs, arg[len - 1]);
            }
        }
    });

    //给模块起一个别名，后期引用方便
    configFns.packages = function (config) {

    };
    /*
     * 模块引入的方式，可以任意修改js引入模式
     * modules.js挂载modules方法。S.config('modules', c);中的c方法
     * */
    configFns.modules = function (modules) {
        if (modules) {
            _.forEach(modules, function (n, mod) {
                if (!loadedModule[mod]) {
                    loadedModule[mod] = {
                        "status": 0
                    };// 等待加载...的模块
                    createScript(mod);
                }
            });
        }
    };
})(HUG);
