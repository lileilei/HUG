HUG.add('button/button',function(S,a,b){
    return a + "     " +b ;
},{requires:['seed/widget','base']});
HUG.config({
    DEBUG:true,
    packages:{
        // 包名
        "$": {
            shim:''
        }
    }
});
HUG.use('toolbar/toolbar','button/button',function(S,toolbar,button){
    console.log(toolbar);
    console.log(button);
});