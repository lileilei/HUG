(function(S,underfine){


    mix(S,{
       mixin:function(s,o){

       }
    });



    function mix(r, s) {
        for (var i in s) {
            r[i] = s[i];
        }
    }
})(HUG);