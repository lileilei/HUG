/*
 * 按需加载所有模块
 * */
;(function(){
    var modules =[
        //{'button/buttonMenu':{requires:['button/button','button.css']}},
        //{'button/button':{requires:['color/color']}},
        //{'color/color':{}}
    ];

    if(typeof module !== "undefined" && typeof exports === "object") {
        var modNames = [];
        for(var i= 0,len=modules.length;i< len;i++){
            for(var key in modules[i]){
                modNames.push(key);
            }
        }
        module.exports =[
            'lib/lodash.min',
            'seed/seed',
            'seed/loader/func',
            'path',
            'seed/loader/loader',
            'seed/modules'
        ].concat(modNames);
        return;
    }
    (function(S,undefined){
        (function(config){
            for(var i= 0,len=modules.length;i< len;i++){
                config(modules[i]);
            }
        })(function (c) {
            S.config('modules', c);
        });
    })(HUG);
})();
