/*
* 按需加载所有模块
* */
(function(S,undefined){
    (function(config){
        config({'config':{requires:['seed/widget']}});
        config({'config':{requires:['seed/loader/func']}});
    })(function (c) {
        S.config('modules', c);
    });
})(HUG);