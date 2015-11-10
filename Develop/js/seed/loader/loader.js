/**
 * Created by alei on 2015/10/15.
 * require
 */
(function (S, underfine) {
    var _ = S.lodash,
        Config = S.Config,
        configFns = Config.fns,
        debug = S.DEBUG,
        baseurl = S.base.path,
        RemoveJsExtFromName= S.addIndexAndRemoveJsExtFromName;

    //存储已经加载好的模块
    var moduleCache = {},
        moduleMap={};

    var createScript =function(filepath,onload){
        if (debug) {
            var oHead = document.getElementsByTagName('HEAD').item(0);
            var oScript = document.createElement("script");
            oScript.type = "text/javascript";
            oScript.src = baseurl + RemoveJsExtFromName(filepath) + ".js?t=" + new Date().valueOf();
            oHead.appendChild(oScript);
            oScript.onload = function(){
                //改变缓存中加载预加载模块的状态为loaded
                moduleCache[filepath]={
                    status:'loaded',
                    fn: 'S.modules["'+filepath+'"]'
                };
                onload && onload();
            };
        } else {
            //var fn = require(filepath);
            moduleCache[filepath]={
                status:'loaded',
                fn: 'S.modules["'+filepath+'"]'
            };
            console.log("require引入js，" + RemoveJsExtFromName(filepath));
            onload && onload();

        }
    };
    function waitLoader(modName, requires,type) {
        //缓存中不存就添加此模块 状态为loading
        if(!moduleCache[modName]){
            moduleCache[modName]={
                status:'loading'
            };
        }
        //如果没有依赖，就直接加载此模块
        var moudusCount = requires && requires.length;
        if(moudusCount==underfine){
            createScript(modName);
            return;
        }
        //modules.js 加载依赖的js
        var loadRequires =function(modName){
            _.each(requires, function(n) {
                var mod = moduleCache[n];
                if(mod){
                    if(mod.status=="loaded"){
                        moudusCount--;
                    }
                    if(moudusCount==0){
                        createScript(modName);
                    }
                }else{
                    //缓存中不存就添加此模块 状态为loading
                    moduleCache[n]={status:'loading'};
                    createScript(n,function(){
                        moudusCount--;
                        if(moudusCount==0){
                            createScript(modName);
                        }
                    })
                }
            });
        };
        //use 方式加载依赖的js
        var useRequires =function(modName,depender){
            console.log(depender);
            _.each(depender, function(n) {
                var mod = moduleCache[n];
                if(mod){
                    if(mod.status=="loaded"){
                        moudusCount--;
                    }
                    if(moudusCount==0){
                        var arr = [];
                        _.each(requires,function(s){
                            arr.push(moduleCache[s].fn);
                        });
                        eval('modName(S,'+arr.join(",")+')');
                    }
                }else{
                    //缓存中不存就添加此模块 状态为loading
                    moduleCache[n]={status:'loading'};
                    createScript(n,function(){
                        moudusCount--;
                        if(moudusCount==0){
                            var arr = [];
                            _.each(requires,function(s){
                                arr.push(moduleCache[s].fn);
                            });
                            eval('modName(S,'+arr.join(",")+')');
                        }
                    })
                }
            });
        };
        if (type=="use") {
            //use 加载方式
            var depends=requires;
            _.each(requires,function(r){
               if(moduleMap[r]){
                   depends = _.union(depends,moduleMap[r]);
               }
            });
            useRequires(modName,requires,depends);
        }else{
            //modules 加载方式
            loadRequires(modName);
        }
    }
    //add 方式加载依赖的js
    var addRequires =function(modName,func,requires){
        // 如果是直接引入的，不是用use 或者 modules 引入的add模块，则自动加上状态已经引入
        if(!moduleCache[modName]){
            moduleCache[modName]={
                status:'loaded',
                fn: 'S.modules["'+modName+'"]'
            };
        }
        var moudusCount = requires && requires.length;
        if(moudusCount==underfine){
            S.modules[modName] = func;
            return;
        }else{
            moduleMap[modName]=requires;
        }
        _.each(requires, function(n) {
            var mod = moduleCache[n];
            if(mod){
                if(mod.status=="loaded"){
                    moudusCount--;
                }
                if(moudusCount==0){
                   S.modules[modName] = func;
                }
            }else{
                //缓存中不存就添加此模块 状态为loading
                moduleCache[n]={status:'loading'};
                createScript(n,function(fn){
                    moudusCount--;
                    if(moudusCount==0){
                        S.modules[modName] = func;
                    }
                })
            }
        });
    };
    _.mixin(S,{
        add:function(){
            var arg = arguments,
                len = arg.length,
                reqs = [];
            reqs = arg[2].requires;
            if(len==3 && _.isObject(arg[2])){
                addRequires(arg[0],arg[1],reqs);
            }else{
                addRequires(arg[0],arg[1]);
            }

        },
        use:function(){
            var arg = arguments,
                len = arg.length,
                reqs = [];
            if(_.isFunction(arg[0])){
                arg[len-1](S);
            }
            if(_.isArray(arg[0])){
                reqs=arg[0];
                waitLoader(arg[1],reqs,'use');
            }
            if(_.isString(arg[0]) && _.isFunction(arg[len-1])){
                reqs= Array.prototype.slice.apply(arguments,[0,len-1]);
                waitLoader(arg[len-1],reqs,'use');
            }
        }
    });

    /*
     * 模块引入的方式，可以任意修改js引入模式
     * modules.js挂载modules方法。S.config('modules', c);中的c方法
     * */
    configFns.modules = function (modules) {
        if (modules) {
            _.forEach(modules, function (n, key) {
                waitLoader(key, n.requires);
            });
        }
    };
})(HUG);
