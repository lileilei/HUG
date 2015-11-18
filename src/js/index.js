HUG.add('button/button', function (S, a, b) {
    return a + "     " + b;
}, {requires: ['seed/widget', 'base']});
HUG.add('toolbar/toolbar', function () {
    return "首页 | 闪电 | 掌众 | 我";
}, {requires: ['seed/widget']});
HUG.config({
    DEBUG: true,
    packages: {
        // 包名
        "$": {
            shim: ''
        }
    }
});
HUG.use('toolbar/toolbar', 'button/button', function (S, toolbar, button) {
    console.log(toolbar);
    console.log(button);
    var a = 1;
    (function () {
        alert(a);
        var a = 2;
    }());
});