HUG.add('button/button', function (S,b) {
    var btn = S.widget('HUG.button',{
        options:{
            color:'red',
            height:'30px',
            width:'100px',
            background:'yellow'
        },
        _create:function(){
            var child = React.createElement('button', null, 'Text Content');
            var root = React.createElement('div', { className: 'button-base' }, child);
            React.render(root, document.body);

            //this.element.style.color=this.options.color;
            //this.element.style.height=this.options.height;
            //this.element.style.width=this.options.width;
            //this.element.style.background=this.options.background;

            //React.render(
            //<h1>Hello, world!</h1>,
            //    document.getElementById('example')
            //);
        }
    });
    return btn;
}, {requires: ['base']});