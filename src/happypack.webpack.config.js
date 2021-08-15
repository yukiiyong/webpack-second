//此文件添加 happypack 、thread-loader配置,hard-source-webpak-plugin
//happupack默认开启cpu的核数-1的进程，也可以传递threads给happypack
const Happypack= require('happypack')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const { webpack } = require('webpack')
module.exports = {
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        use: 'Happypack/loader?id=js',
        include: [path.resolve(__dirname, 'src')]
      },
      {
        test: /\.jsx$/,
        use: ['thread-loader','cache-loader','babel-loader']
      },
      {
        test: /\.css$/,
        use: 'Happypack/loader?id=css',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules', 'bootstrap', 'dist')
        ]
      }
    ],
    noParse: /jquery|lodash/
  },
  plugins: [
    new Happypack({
      id: 'js', //将rule中的id=js对应
      //将之前rule中的loader在此配置
      use: ['babel-loader']
    }),
    new Happupack({
      id: 'css', //和rule中的id=css对应
      use: ['style-loader','css-loader','postcss-loader']
    }),
    new HardSourceWebpackPlugin(),
    //webpack打包时，忽略moment包 里面的本地化内容
    new webpack.IgnorePlugin(/^\.\/locale$/,/moment$/)
  ],
  //配置了externals之后，可以通过import的方式引入
  //且希望webpack不会对其进行打包
  externals: {
    //jquery通过script引入之后，全局中就有了jquery变量
    'jquery': 'jQuery'
  },
  optimization: {
    splitChunks: {
      cacheGroup: {
        vendor: {
          priority: 1,  //设置优先级，首先抽离第三方模块
          name: 'vendor', 
          test: /node_modules/,
          minChunks: 1, //最少引用了1次
          minSize: 0,
          chunks: 'initial'
        },
        common: {
          //公共模块
          name: 'common',
          chunks: 'initial',
          minSize: 100, //大小超过100个字节
          minChunks: 3 //最少引入了3次
        }
      }
    },
    //将包含chunk映射关系列表从main.js抽离出来
    //最终构建出来的文件会生成一个manifest.js
    runtimeChunk: {
      name: 'manifest'
    }
  }
}