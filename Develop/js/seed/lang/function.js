(function(S){
    //合并
    S.mix=function(r, s) {
        for (var i in s) {
            r[i] = s[i];
        }
    };
    //深度拷贝
    S.mixin=function(r,s){
        var s = s || {};
        for (var i in s) {
            if (typeof s[i] === 'object') {
                r[i] = (s[i].constructor === Array) ? [] : {};
                mixin(r[i], s[i]);
            } else {
                r[i] = s[i];
            }
        }
    }
})(HUG);