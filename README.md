#### 静态资源拷贝 
###### copy-webpack-plugin  
- 不需要编译的资源,只拷贝  (public/js -> dist/js)    
``` 
new CopyWebpackPlugin([
    {from: 'public/js/*,js',
    to: path.resolve(__dirname, 'dist', js),
    flatten: true //为true只拷贝文件，不把文件夹路径都拷贝上
])
```
- 过滤掉某些静态资源： ignore参数  

#### ProvidePlugin 
- 不需要在项目中require/import，而是提前赋值给一个全局变量  
- 此全局变量在项目中到处可用  
```
new webpack.ProvidePlugin({
identifier: 'module1',
identifier: ['module2', 'property2'] // property为参数，如default
})
```   
- vue的配置 vue.esm.js 中使用export default 导出。 所以需要指定default  
- React使用module.exports导出，所以不需要写default  
- eslint配置文件中globals属性对应引入库的全局变量置为true
```
//eslint
{
    "globals": {
    "React": true
}
}
```  
#### 抽离css 
1. 
``` 
new MiniCssExtractPlugin({
filename: 'css/[name].css',
publicPath: '../' //若你的output.publicPath配置的是’./'这种相对路径，那么如果将CSS文件放在单独目录下，记得在这里指定一下publicPath
})
```  
2. loader 中的style-loader不写，用MiniCssExtractPlugin.loader替代  
3. CSS修改后页面自动刷新 ，配置Minicssoptions
```
{
    loader: MiniCssExtractPlugin.loader, 
    options: { hmr: isDev, reloadAll: true, }
}
 ```
4. 将抽离出来的CSS进行压缩  
`optimize-css-assets-webpack-plugin(OptimizeCSSPlugin)`  
**配置方式**：  
4.1 plugins配置 new OptimizeCssPlugin() CSS和js可以正常压缩  
4.2 optimization 需另外配置js压缩（开发环境下不需要Css压缩，可放到webpack.config.prod.js）

#### 按需加载 
- webpack内置了强大的代码分割功能以实现按需加载（import）  
-  import() 语法需 @babel/plugin-syntax-dynamic-import (@babel/preset-env 内置）  

webpack在遇到import(****)语句时这么处理
1. 以 **** 为入口新生成一个chunk
2. 当代码执行到import所在语句时，才会加载该chunk对应文件

#### 热更新 
1. 配置 DevServer.hot = true  
2. plugins 中添加 new  webpack.HotModuleReplacementPlugin()
热更新配置后不需要整个页面刷新（局部刷新）  
3. 入口文件添加
```
if(module && module.hot){
    module.hot.accept()
}
```

#### resolve
1. **modules** 配置 webpack 去哪些目录下寻找第三方模块。默认情况下，只会去 node_modules 下寻找   
```
resolve: {
  modules: ['./src/components', 'node_modules'] 
  //从左到右依次查找
}    
```
2. **alias **  把导入路径映射成新的路径
3. **extesions** 需引入的第三方模块的后缀（适用于多端系统）
4. **enforceExtension** 引入第三方模块时不能缺省文件后缀
5.** mainFields** 有些第三方模块提供多份代码
import时对应依赖的package.json   中字段引入的代码、  
如 import 'bootstrap'， 默认情况下，找的是对应的依赖的package.json 的 main字段指定的文件
即dist/js/bootstrap   
若我们希望import 'bootstrap' 默认找css文件的话，可以配置resolve.mainFields = ['style','main']

#### 多页应用打包 
```
new HtmlWebpackPlugin({
    template: 'public/login.html',
    filename: 'login.[hash:6].html', //打包后的文件名 
    chunks: ['login'], //在html文件中引入的js文件，数组
    excludeChunks: ['index'] //不需引入的js文件，数组
})
```   
#### 区分不同环境
1. 根据process.env.NODE_ENV 区分  
2. 创建多个配置文件  
webpack.base.js (公共配置)   
webpack.dev.js （开发环境）  
webpack.prod.js （生产环境）  

 **webpack-merge  **
-  提供了merge函数来连接数组，合并对象  
- merge.smart在合并loader时，会将同一个匹配规则的进行合并

#### 定义不同环境变量
使用webpack.DefinePlugin来定义环境变量  
DefinePlugin中 的每一个键，都是一个标识符  
1. 如果 value 是一个字符串，会被当做 code 片段
2. 如果 value 不是一个字符串，会被stringify
3. 如果 value 是一个对象，正常对象定义即可
4. 如果 key 中有 typeof，它只针对 typeof 调用定义
```
new webpack.DefinePlugin({
    DEV: JSON.stringify('dev'), //字符串
    FLAG: 'true' //FLAG 是个布尔类型
})
//index.js
if(DEV === 'dev') {
    //开发环境
}else {
    //生产环境
}
```  
#### 解决跨域问题 
1. 
```
devServer.proxy = { "/api": "http://localhost:4000" }
```
2. 后端接口不包含 /api 时  
```
DevServer.proxy = {
    '/api': {
        target: 'http://localhost:4000',
        pathRewrite: {
            '/api': ''
        }
    }
}
```  
#### 前端mock数据
```
devServer.before(app){
    app.get('/user', (req, res) => {
        res.json({name: 'aaa'})
    })
}
```