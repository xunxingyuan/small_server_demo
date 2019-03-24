module.exports = {
  //数据库
  mongodb: {
    path: "127.0.0.1:27017/test",
    auth: {
      user: "admin",
      password: "admin"
    }
  },
  //redis配置
  redis: {
    url: "127.0.0.1",
    ttl: 60 * 60
  },
  //微信授权
  wechat: {
    AppID: "AppID",
    AppSecret: "AppSecret"
  }
};
