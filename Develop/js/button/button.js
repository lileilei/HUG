HUG.add('button/button', function (S,b) {
    var btn = S.widget('HUG.button',{
        options:{
            color:'red',
            size:'30px'
        },
        _create:function(){
            alert(this.element);
            alert("_create   默认颜色为："+this.options.color);
        }
    });
    return btn;
}, {requires: ['base']});