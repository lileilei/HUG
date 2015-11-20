(function(S){

    S.mixin(S,{
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
            S[ namespace ][ name ] = function( options, element) {
                if ( arguments.length ) {
                    this._createWidget( options, element );
                }
            };
            S.extend(S[ namespace ][ name],base);
            S[ namespace ][ name].prototype= _.assign({},base.prototype,{
                namespace: namespace,
                widgetName: name,
                widgetBaseClass: fullName
            },prototype);
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
        widgetName: "widget",
        options:{

        },
        _createWidget: function (options,element) {
            this.element = element;
            this.options = _.assign(this.options,options);
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
})(HUG);