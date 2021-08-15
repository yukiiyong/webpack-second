const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development' 
const webpack = require('webpack')
const config = require('./public/config')[isDev ? 'dev' : 'build']
console.log(config)
module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'), //必须是绝对路径
    filename: 'bundle.[hash:6].js',
    publicPath: '/' //一般为cdn地址
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map',
  // devtool: 'cheap-module-eval-source-map', //只生成行列数，不生成map文件
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     presets:  ['@babel/preset-env'],
        //     plugins: [
        //       [
        //         "@babel/plugin-transform-runtime",
        //         {
        //           "corejs": 3
        //         }
        //       ]
        //     ]
        //   }
        // },
        exclude: /node-modules/ //排除node-modules目录
      },
      {
        test: /\.(le|c)ss$/,
        use: ['style-loader', 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: function() {
              return [
                require('autoprefixer')()
              ]
            }
          }
        }, 'less-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, //10k,转为base64
              //大于10k，转为file-loader处理,将文件拷贝到dist目录
              // name: '[name]_[hash:6].[ext]',
              esModule: false //解析url地址
            }
          }
        ],
        exclude: /node_modules/
      }
      // {
      //   test: /.html$/,
      //   use: 'html-withimg-loader'
      // }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      minify: {
        removeAttributeQuotes: false,
        collapseWhitespace: false
      },
      config: config.template
      // hash: true
    }),
    //不需要传参，插件自己可以找到outputPath
    new CleanWebpackPlugin({
      //不删除dll目录下文件
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**']
    }),
    // //copy-webpack-plugin 9.0 的配置需要加patterns
    // //copy-webpack-plugin 5.0 的配置不需要，为数组
    // new CopyWebpackPlugin([
    //   {
    //     //从public/js目录拷贝到dist/js目录
    //     //不会出现在index.html找不到引用的js文件
    //     from: 'public/js/*.js',
    //     to: path.resolve(__dirname, 'dist', 'js'),
    //     flatten: true //flatten为true，只拷贝文件，不拷贝文件夹路径,patterns[0].flatten不合法
    //   }, 
    // ],
    // {
    //   //过滤某个或某些文件
    //   ignore: ['other.js'] 
    // }),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    port: '3000', //端口，默认是8080
    quiet: false, //默认不启用
    inline: true, //默认开启inline 模式，如果设置为false，开启iframe模式
    stats: "errors-only", //终端仅打印error
    overlay: false, //默认不启用 
    clientLogLevel: "silent", //日志等级
    compress: true, //是否启用gzip压缩
    hot: true
  }
}