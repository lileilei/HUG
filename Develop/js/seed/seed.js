/**
 * Created by alei on 2015/10/15.
 * @params: _ = lodash.js 牛逼的方法 后期使用自己的lang
 */

var HUG =(function(_){
    var S = {
        version:"1.0.0",
        modules:[],//写在add 方法中
        Config:{
            fns:{}
        },
        base:{

        },
        lodash:_
    };
    _.mixin(S,{
        config:function (configName, configValue) {
            var cfg,
                r,
                self = this,
                fn,
                Config = S.Config,
                configFns = Config.fns;
            if (_.isObject(configName)) {
                _.forEach(configName, function (configValue, p) {
                    fn = configFns[p];
                    if (fn) {
                        fn.call(self, configValue);
                    } else {
                        Config[p] = configValue;
                    }
                });
            } else {
                cfg = configFns[configName];
                if (configValue === undefined) {
                    if (cfg) {
                        r = cfg.call(self);
                    } else {
                        r = Config[configName];
                    }
                } else {
                    if (cfg) {
                        r = cfg.call(self, configValue);
                    } else {
                        Config[configName] = configValue;
                    }
                }
            }
            return r;
        }
    });
        return S;
})(_,undefined);
