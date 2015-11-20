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

HUG.use('button/button', function (S, button) {
    var btn = new button({
        aa: "df"
    },document.getElementById("container"));
});
