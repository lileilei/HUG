;(function (S) {
    _.mixin(S, {
        //自动添加后缀.js, 如果是/则自动加上index.js
        addIndexAndRemoveJsExtFromName: function (name) {
            if (_.endsWith(name, '/')) {
                name += 'index';
            }
            if (_.endsWith(name, '.js')) {
                name = name.slice(0, -3);
            }
            return name;
        },
        //获取当期文件的绝对路径
        getBasePath : function(){
            var result = "",m;
            try{
                a.b.c();
            }catch(e){
                if(e.fileName){//firefox
                    result = e.fileName;
                }else if(e.sourceURL){//safari
                    result = e.sourceURL;
                }else if(e.stacktrace){//opera9
                    m = e.stacktrace.match(/\(\) in\s+(.*?\:\/\/\S+)/m);
                    if (m && m[1])
                        result =  m[1]
                }else if(e.stack){//chrome 4+
                    m= e.stack.match(/\(([^)]+)\)/);
                    if (m && m[1])
                        result = m[1]
                }
            }
            if(!result){//IE与chrome4- opera10+
                var scripts = document.getElementsByTagName("script");
                var reg = /dom([.-]\d)*\.js(\W|$)/i,src;
                for(var i=0, el; el = scripts[i++];){
                    src = !!document.querySelector ? el.src:
                        el.getAttribute("src",4);
                    if(src && reg.test(src)){
                        result = src;
                        break;
                    }
                }
            }
            return result.substr( 0, result.lastIndexOf('/'))+"/";
        }
    })
})(HUG);