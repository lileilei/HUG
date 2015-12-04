var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var srcDir = path.resolve(process.cwd(), 'src');
var sourceMap = require('./sourcemap.json');
//抽离公共js
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin({
    name: "common",
    minChunks: 2
});
//全局自动引入的js
var gloabPlugin=new webpack.ProvidePlugin({
    React:'react',
    ReactDOM:'react-dom'
});
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var entries = genEntries();
module.exports = {
    //插件项
    plugins: [commonsPlugin,gloabPlugin],
    //externals:{
    //    zepto:"Zepto"
    //},
    //页面入口文件配置
    entry: entries,
    //入口文件输出配置
    output: {
        path: 'dist/react/',
        filename: '[name].js',
        publicPath:'dist/react',
        chunkFilename: "[name].chunk.js"
    },
    resolveLoader: {
        root: path.join(__dirname, 'node_modules')
    },
    module: {
        //加载器配置
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.js$/, loader: 'babel',query: {
                presets: ['react', 'es2015'],
                cacheDirectory: true
            } },
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    //其它解决方案配置
    resolve: {
        root: [path.join(__dirname, 'public/lib/'), './node_modules'], //绝对路径
        extensions: ['', '.js', '.json', '.scss'],
        alias: sourceMap
    }
};
function genEntries() {
    var jsDir = path.resolve(srcDir, 'react');
    var names = fs.readdirSync(jsDir);
    var map = {};

    names.forEach(function(name) {
        var m = name.match(/(.+)\.js$/);
        var entry = m ? m[1] : '';
        var entryPath = entry ? path.resolve(jsDir, name) : '';

        if(entry) map[entry] = entryPath;
    });

    return map;
}

//webpack --display-error-details// 最基本的启动webpack的方法
//webpack -w      // 提供watch方法；实时进行打包更新
//webpack -p      // 对打包后的文件进行压缩
//webpack -d      // 提供source map，方便调式代码