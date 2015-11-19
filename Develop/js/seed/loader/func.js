;
(function (S) {
    var _ = S.lodash;
    var isReady = false; //判断onDOMReady方法是否已经被执行过
    var readyList = [];//把需要执行的方法先暂存在这个数组里
    var timer;//定时器句柄

    //文档加载完毕后事件
    _.mixin(S, {
        ready: function (fn) {
            if (isReady)
                fn.call(document);
            else
                readyList.push(function () {
                    return fn.call(this);
                });
            return this;
        },
        extend: extend,
        widget: function ( name ,base, prototype) {
            var namespace = name.split( "." )[ 0 ],
                fullName;
            name = name.split( "." )[ 1 ];
            fullName = namespace + "-" + name;
            if (!prototype) {
                prototype = base;
                base = widget;
            }
            // 创建命名空间$.om.tabs
            S[ namespace ] = S[ namespace ] || {};
            S[ namespace ][ name ] = function( options, element ) {
                if ( arguments.length ) {
                    this._createWidget( options, element );
                }
            };
            S[ namespace ][ name].prototype= _.assign(base.prototype,{
                namespace: namespace,
                widgetName: name,
                widgetBaseClass: fullName
            },prototype);
            extend(S[ namespace ][ name],base);
            return S[ namespace ][ name];
        }
    });

    //widget 小部件
    function widget(options, element) {
        if (arguments.length) {//如果有参数，调用初始化函数
            this._createWidget(options, element);
        }
    }

    widget.prototype = {
        options:{

        },
        _createWidget: function (options,element) {
            this.element = element;
            this.options = _.defaultsDeep(this.options,options);
            // 开发者实现
            this._create();
            // 如果绑定了初始化的回调函数，会在这里触发。注意绑定的事件名是需要加上前缀的，如$('#tab1').bind('tabscreate',function(){});
            this._trigger( "create" );
            // 开发者实现
            this._init();
        },
        _create:function(){
            alert("widget _create~~");
        },
        _init:function(){
            alert("widget init~~");
        },
        destroy:function(){

        },
        _trigger:function(){

        }
    };
    //extend方法
    function extend(Child, Parent) {
        var F = function () {
        };
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.uber = Parent.prototype;
    }

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
})(HUG, undefined);