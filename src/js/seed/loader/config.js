/**
 * Created by alei on 2015/10/15.
 * require
 */
(function(S,underfine){
    var _= S.lodash,
        Config = S.Config,
        configFns = Config.fns,
        debug = S.DEBUG;
    function addIndexAndRemoveJsExtFromName(name) {
        if (_.endsWith(name,'/')) {
            name += 'index';
        }
        if (_.endsWith(name,'.js')) {
            name = name.slice(0, -3);
        }
        return name;
    }
    /*
    * 模块引入的方式，可以任意修改js引入模式
    * modules.js挂载modules方法。S.config('modules', c);中的c方法
    * */
    configFns.modules = function (modules) {
        if(modules){
            _.forEach(modules, function(n, key) {
                _.map(n.requires,function(filepath){
                    if(debug){
                        var oHead = document.getElementsByTagName('HEAD').item(0);

                        var oScript= document.createElement("script");

                        oScript.type = "text/javascript";

                        oScript.src="src/js/" + addIndexAndRemoveJsExtFromName(filepath)+".js?t="+new Date().valueOf();

                        oHead.appendChild( oScript);
                    }else{
                        //require(filepath);
                        console.log("require引入js，"+addIndexAndRemoveJsExtFromName(filepath));
                    }
                })
            });
        }
    };
})(HUG);
