//HUG.add('button/button', function (S, a, b) {
//    return a + "     " + b;
//}, {requires: ['seed/widget', 'base']});
//HUG.add('toolbar/toolbar', function () {
//    return "首页 | 闪电 | 掌众 | 我";
//}, {requires: ['seed/widget']});
//HUG.config({
//    DEBUG: true,
//    packages: {
//        // 包名
//        "$": {
//            shim: ''
//        }
//    }
//});
var mixin =function(r,s){
    var s = s || {};
    for (var i in s) {
        console.log(r[i]);
        console.log(s[i]);
        if (typeof s[i] === 'object') {
           // r[i] = (s[i].constructor === Array) ? [] : {};
            mixin(r[i], s[i]);
        } else {
            r[i] = s[i];
        }
    }
};
var S = {a:0,c:{haha:100}};
mixin(S,{
    a:1,
    b:2,
    c:{
        g:4
    }
});
console.log(S);
//HUG.use('button/button', function (S, button) {
//    var btn = new button({
//        aa: "df"
//    },document.getElementById("demurrage"));
//});