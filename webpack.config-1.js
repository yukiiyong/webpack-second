const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const isDev = process.env.NODE_ENV === 'development' 
const webpack = require('webpack')
const config = require('./public/config')[isDev ? 'dev' : 'build']
console.log(config)
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'), //必须是绝对路径
    filename: 'bundle.[hash:6].js',
    publicPath: '/' //一般为cdn地址
  },
  // devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map',
  devtool: 'cheap-module-eval-source-map', //只生成行列数，不生成map文件
  resolve: {
    //resolve.modules 中定义webpack需在那些目录查找第三方模块
    // modules: ['./src/component', 'node_modules'], //从左到右依次查找
    //通过别名把原路径映射成新的导入路径，用于简化导入路径
    // alias: {
    //   'component': './src/component'
    // },
    //用于适配多端项目
    // extensions: ['web.js', 'js', 'json'],
    //为 true不能缺省文件后缀
    // enforceExtension: true
    //指定提供多芬代码的第三方模块的文件
    //对应依赖的package.json中对应字段
    // mainFields: ['style', 'main']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['cache-loader','babel-loader'],
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
        test: /\.(le|c)ss$/,
        use: [MiniCssExtractPlugin.loader, //替换之前的style-loader
          'css-loader', 
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [
                  require('autoprefixer')(
                    //多个loader共享配置时，需在根目录新建文件 .browserlistrc
                    // { "overrideBrowserslist": ["default"]}
                  )
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
      // hash: true,
      // chunks: ['index'] //chunks数组中定义要引入html的js文件
    }),
    //不需要传参，插件自己可以找到outputPath
    new CleanWebpackPlugin({
      //不删除dll目录下文件
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**']
    }),
    // new webpack.HotModuleReplacementPlugin(),
    //copy-webpack-plugin 9.0 的配置需要加patterns
    //copy-webpack-plugin 5.0 的配置不需要，为数组
    new CopyWebpackPlugin([
      {
        //从public/js目录拷贝到dist/js目录
        from: 'public/js/*.js',
        to: path.resolve(__dirname, 'dist', 'js'),
        flatten: true //flatten为true，只拷贝文件，不拷贝文件夹路径,patterns[0].flatten不合法
      }, 
    // {
    //   //过滤某个或某些文件
    //   ignore: ['other.js'] 
    // }
  ]),
    new webpack.ProvidePlugin({
      Vue: ['vue/dist/vue.esm.js', 'default'] //vue 使用default导出
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css' //存放css的位置
      //若您的outputPath配置的是'./'这种相对路径，那么如果将css文件放在单独目录下，记得在这里指定一下publicPath
      // publicPath: '../'
    }),
    new webpack.DefinePlugin({
      DEV: JSON.stringify('dev'),
      FLAG: 'true' //FLAG是个布尔类型
    }),
    new OptimizeCssPlugin(),
    new webpack.HotModuleReplacementPlugin(),//index.js 添加module.hot.accept
    new BundleAnalyzerPlugin()
  ],
  devServer: {
    port: 3000, //端口，默认是8080
    quiet: false, //默认不启用
    inline: true, //默认开启inline 模式，如果设置为false，开启iframe模式
    stats: "errors-only", //终端仅打印error
    overlay: false, //默认不启用 
    clientLogLevel: "silent", //日志等级
    compress: true, //是否启用gzip压缩
    hot: true,
    proxy: {
      // '/api': 'http://localhost:4000'
      '/api': {
        target: 'http://localhost:4000',
        pathRewrite: {
          '/api': '' //重写接口，去掉/api
        }
      }
    },
    //前端模拟数据
    before(app) {
      app.get('/user',(req, res) => {
        res.json({name: 'aaa'})
      })
    }
  }
}