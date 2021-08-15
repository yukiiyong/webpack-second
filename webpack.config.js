const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development' 
const webpack = require('webpack')
const config = require('./public/config')[isDev ? 'dev' : 'build']
const { ProvidePlugin } = require('webpack')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
console.log(config)

const smp = new SpeedMeasurePlugin()
//将webpack配置赋值给config变量
//然后用speed-measure-webpack-plugin的实例smp包裹config
const webpackConfig = {
  mode: isDev ? 'development' : 'production',
  // entry: './src/index.js',
  entry: {
    index: './src/index.js',
    login: './src/login.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'), //必须是绝对路径
    filename: 'bundle.[hash:6].js',
    publicPath: '/' //一般为cdn地址
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map',
  // devtool: 'cheap-module-eval-source-map', //只生成行列数，不生成map文件
  resolve: {
    //webpack从哪些目录查找第三方模块
    modules: ['./src', 'node_modules'],
    alias: {
      'components': './src/components'
    },
    extensions: ['.js'], //可以说['web.js','.js','.json','.css']
    enforceExtension: false //不能缺省文件后缀
    //mainFields: ['style','main']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        //在babel-loader前增加cache-loader，可以将babel-loader转换后的结果缓存到磁盘中
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
        //include优先级大于exclude，优先使用include
        include: [path.resolve(__dirname, 'src')]
        // exclude: /node-modules/ //排除node-modules目录
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          { //替换之前的style-loader
            loader: MiniCssExtractPlugin.loader,
            options: {
              //抽离css之后设置自动刷新
              hmr: isDev,
              reloadAll: true
            }
          }, 
          'css-loader', {
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
      filename: 'index.html', //打包后的文件名
      minify: {
        removeAttributeQuotes: false,
        collapseWhitespace: false
      },
      config: config.template
      // hash: true
    }),
    new HtmlWebpackPlugin({
      template: './public/login.html',
      filename: 'login.html'
    }),
    //不需要传参，插件自己可以找到outputPath
    new CleanWebpackPlugin({
      //不删除dll目录下文件
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**']
    }),
    // //copy-webpack-plugin 9.0 的配置需要加patterns
    // //copy-webpack-plugin 5.0 的配置不需要，为数组
    new CopyWebpackPlugin([
      {
        //从public/js目录拷贝到dist/js目录
        //不会出现在index.html找不到引用的js文件
        from: 'public/js/*.js',
        to: path.resolve(__dirname, 'dist', 'js'),
        flatten: true //flatten为true，只拷贝文件，不拷贝文件夹路径,patterns[0].flatten不合法
      }
    ],
    {
      //过滤某个或某些文件
      ignore: ['other.js'] 
    }),
    //不需要import 或 require 就可在项目到处使用
    new webpack.ProvidePlugin({
      Vue: ['vue/dist/vue.esm.js', 'default'],
      _map: ['lodash', 'map']
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      //若您的outputPath配置的是'./'这种相对路径，那么如果将css文件放在单独目录下，记得在这里指定一下publicPath
      // publicPath: '../'
    }),
    new OptimizeCssPlugin(),
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
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        pathRewrite: {
          'api': '' //重写接口，去掉/api
        }
      }
    },
    before(app) {
      app.get('/user', (req,res) => {
        res.json({name: 'aaa', msg: 'locate at user'})
      })
    }
  }
}

module.exports = smp.wrap(webpackConfig)