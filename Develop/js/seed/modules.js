/*
 * 按需加载所有模块
 * */
(function(S,undefined){
    (function(config){
        //config({'index':{requires:['color/color']}});
    })(function (c) {
        S.config('modules', c);
    });
})(HUG);
