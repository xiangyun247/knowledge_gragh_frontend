// Vue CLI 配置文件
module.exports = {
  // 开发服务器配置
  devServer: {
    // 代理配置
    proxy: {
      // 将所有以 /api 开头的请求代理到后端服务
      '/api': {
        target: 'http://localhost:5001', // 后端服务地址
        changeOrigin: true, // 是否改变请求源
        ws: true, // 是否支持 WebSocket
        pathRewrite: {
          '^/api': '/api' // 路径重写规则
        }
      }
    },
    // 开发服务器端口
    port: 8080,
    // 自动打开浏览器
    open: true
  },
  // 构建配置
  configureWebpack: {
    // 其他配置...
  }
};