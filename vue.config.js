module.exports = {
  // 修改的配置
  // 将baseUrl: '/api',改为baseUrl: '/',
  publicPath: '/',
  lintOnSave: process.env.NODE_ENV !== 'production',
  devServer: {
    host: "localhost",
    port: 80,
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        // target: 'http://101.200.137.22:3000/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/wx': {
        target: 'https://api.weixin.qq.com/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/wx': ''
        },
      },
      '/mapCoord': {
        target: 'https://api.map.baidu.com',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/mapCoord': ''
        }
      }
    }
  }
}