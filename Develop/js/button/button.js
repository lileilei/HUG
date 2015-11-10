HUG.add('button/button',function(S,color){
    var _ = S.lodash;
    _.mixin(S,{
        button:function(){
            document.getElementById("ready").addEventListener("click",function(){
                alert(color.red);
            });
        }
    });
},{requires:['color/color']});