(function () {
    require('../style/reset.css');
    require('../style/common.css');
    require('../style/font.css');
    var SearchBar =require('./view/header');
    var FootMenu =require('./view/footer');
    var IScroll = require("IScroll");

var items =[{id:"1",title:"闪电理财",num:"10%"},
    {id:"2",title:"闪电借款",num:"12%"},
    {id:"3",title:"闪电理财",num:"10%"},
    {id:"4",title:"闪电理财",num:"10%"},
    {id:"5",title:"闪电理财",num:"10%"},
    {id:"6",title:"闪电理财",num:"10%"},
    {id:"7",title:"闪电理财",num:"10%"},
    {id:"8",title:"闪电理财",num:"10%"},
    {id:"9",title:"闪电理财",num:"10%"},
    {id:"10",title:"闪电理财",num:"10%"}];
var ProductRow = React.createClass({
    render: function() {
        return <li>{this.props.item.id} : {this.props.item.title }利率:{this.props.item.num}</li>
    }
});
var FilterableProductTable = React.createClass({
        componentDidMount: function () {
            if (this.isMounted()) {
                    console.log(ReactDOM.findDOMNode(this));
                this.scroll = new IScroll(ReactDOM.findDOMNode(this),{
                    scrollbars: true,
                    mouseWheel: true,
                    interactiveScrollbars: true,
                    shrinkScrollbars: 'scale',
                    fadeScrollbars: true
                });
                document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
            }
        },
        render: function() {
            var row=[];
            this.props.items.map(function(item){
                row.push(<ProductRow item={item} key={item.id} />)
            });
            return (
                <div id="container">
                    <div id="layout">
                        <ul>
                            {row}
                        </ul>
                    </div>
                    <SearchBar />
                    <FootMenu />
                </div>
            );
        }
});


    ReactDOM.render(
    <FilterableProductTable items={items}/>,
        document.getElementById("main")
    );
})();