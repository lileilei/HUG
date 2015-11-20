(function (S) {
    var isReady = false; //判断onDOMReady方法是否已经被执行过
    var readyList = [];//把需要执行的方法先暂存在这个数组里
    var timer;//定时器句柄

    //合并
    S.mix = function (r, s) {
        for (var i in s) {
            r[i] = s[i];
        }
    };
    //深度合并对象
    S.mixin = function (r, s) {
        var s = s || {};
        for (var i in s) {
            if (typeof s[i] === 'object') {
                // r[i] = (s[i].constructor === Array) ? [] : {};
                mixin(r[i], s[i]);
            } else {
                r[i] = s[i];
            }
        }
        return r;
    };

    S.mixin(S, {
        //extend方法
        extend: function (Child, Parent) {
            var F = function () {
            };
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.uber = Parent.prototype;
        },
        //DomReady
        ready: function (fn) {
            if (isReady)
                fn.call(document);
            else
                readyList.push(function () {
                    return fn.call(this);
                });
            return this;
        }
    });

    //DomReady 方法
    var onDOMReady = function () {
        for (var i = 0; i < readyList.length; i++) {
            readyList[i].apply(document);
        }
        readyList = null;
    };
    var bindReady = function (evt) {
        if (isReady) return;
        isReady = true;
        onDOMReady.call(window);
        if (document.removeEventListener) {
            document.removeEventListener("DOMContentLoaded", bindReady, false);
        }
        else if (document.attachEvent) {
            document.detachEvent("onreadystatechange", bindReady);
            if (window == window.top) {
                clearInterval(timer);
                timer = null;
            }
        }
    };
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", bindReady, false);
    }
    else if (document.attachEvent) {
        document.attachEvent("onreadystatechange", function () {
            if ((/loaded|complete/).test(document.readyState))
                bindReady();
        });
        if (window == window.top) {
            timer = setInterval(function () {
                try {
                    isReady || document.documentElement.doScroll('left');//在IE下用能否执行doScroll判断 dom是否加载完毕
                }
                catch (e) {
                    return;
                }
                bindReady();
            }, 5);
        }
    }
    return S;
})(HUG);