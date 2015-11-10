(function (S) {
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
        }
    })
})(HUG);