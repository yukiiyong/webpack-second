//示例，一般定义在webpack.config.js
const { webpack } = require('webpack');
const merge = require('webpack-merge')

merge({
  devtool: 'cheap-module-eval-source-map',
  module: {
    rules: [
      {a: 1}
    ]
  },
  plugins: [2,3,4]
}, {
  devtool: 'none',
  mode: 'production',
  module: {
    rules: [
      {a: 2},
      {b: 1}
    ]
  },
  plugins: [6, 7, 8]
});

//合并后结果为
{
  devtool: 'none',
  mode: 'production',
  module: {
    rules: [
      {a: 1},
      {a: 2},
      {b: 1}
    ]
  },
  plugins: [2, 3, 4, 6, 7, 8]
}

//也可以这样配置
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.config.base')

module.exports = merge(baseWebpackConfig, {
  mode: 'development'
  //其他一些配置
})

//修改package.json中对应的config文件

//package.json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack-dev-server --config=webpack.config.dev.js",
    "build": "cross-env NODE_ENV=production webpack --config=webpack.config.prod.js"
  }
}

//webpack.config.dev.js
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      DEV: JSON.stringify('dev'), //字符串
      FLAG: 'true' //FLAG是个布尔类型
    })
  ]
}

//index.js
if(DEV === 'dev') {
  //开发环境
} else {
  //生产环境
}