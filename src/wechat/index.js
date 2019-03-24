const config = require("../../conf/conf");
const Http = require("axios");
const db = require("../db/index");
const wechat = db.Wechat;

let getTokenData = async () => {
  let check = await wechat.findOne({
    name: "access_token"
  });
  let now = new Date().getTime();
  if (check) {
    if (check.expires_in < now) {
      let result = await getToken();
      let update = await wechat.updateOne(
        { name: "access_token" },
        {
          $set: {
            access_token: result.data.access_token,
            expires_in: now + result.data.expires_in * 1000
          }
        }
      );
      if (update) {
        console.log("更新wechat token成功");
      }
      return result.data.access_token;
    } else {
      console.log("wechat token有效");
      return check.access_token;
    }
  } else {
    let result = await getToken();
    if (result.data.access_token) {
      let add = await new wechat({
        name: "access_token",
        access_token: result.data.access_token,
        expires_in: now + result.data.expires_in * 1000
      }).save();
      if (add) {
        console.log("初始化wechat token成功");
      }
      return result.data.access_token;
    } else {
      return "";
    }
  }
};

let getToken = async () => {
  let url =
    "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" +
    config.wechat.AppID +
    "&secret=" +
    config.wechat.AppSecret;

  return await Http.get(url);
};

exports.getTokenData = getTokenData();
