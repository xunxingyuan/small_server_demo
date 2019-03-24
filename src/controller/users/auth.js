const db = require("../../db/index");
const User = db.User;
const config = require("../../../conf/conf");
const Json = require("../../tools/jsonResponse");
const Http = require("axios");

//获取用户openId

async function getUser(code) {
  let url =
    "https://api.weixin.qq.com/sns/jscode2session?appid=" +
    config.wechat.AppID +
    "&secret=" +
    config.wechat.AppSecret +
    "&js_code=" +
    code +
    "&grant_type=authorization_code";
  return await Http.get(url);
}

//创建用户
async function createUser(ctx, data) {
  let add = await new User(data).save();
  if (add) {
    Json.res(ctx, 200, "创建用户并且登录成功");
  } else {
    Json.res(ctx, 10002, "用户创建失败");
  }
}

//更新用户
async function updateUser(ctx, data) {
  let update = await User.updateOne(
    {
      openid: data.openid
    },
    {
      $set: data
    }
  );
  if (update) {
    Json.res(ctx, 200, "登录成功");
  } else {
    Json.res(ctx, 10001, "用户信息更新失败");
  }
}

module.exports = {
  login: async (ctx, next) => {
    let req = ctx.request.body;
    let user = ctx.request.body.sessionUser;
    let now = new Date().getTime();
    //检查缓存
    if (user) {
      let userInfo = JSON.parse(user);
      if (userInfo.login_expire > now) {
        Json.res(ctx, 200, "登录成功");
      } else {
        let result = await getUser(req.code);
        if (result.data) {
          let updateData = {
            session_key: result.data.session_key,
            session_key_expire: now + result.data.expires_in * 1000
          };
          if (result.data.unionid) {
            updateData["unionid"] = result.data.unionid;
          }
          ctx.session.user = JSON.stringify({
            openid: updateData.openid,
            login_expire: updateData.session_key_expire
          });
          await updateUser(ctx, updateData);
        } else {
          Json.res(ctx, 10003, "微信用户授权失败");
        }
      }
    } else {
      let result = await getUser(req.code);

      if (result.data) {
        //检查是否存在用户
        let check = await User.findOne({
          openid: result.data.openid
        });
        if (check) {
          //更新用户
          let updateData = {
            session_key: result.data.session_key,
            session_key_expire: now + result.data.expires_in * 1000
          };
          if (result.data.unionid) {
            updateData["unionid"] = result.data.unionid;
          }
          ctx.session.user = JSON.stringify({
            openid: result.data.openid,
            login_expire: updateData.session_key_expire
          });
          await updateUser(ctx, updateData);
        } else {
          //新建用户
          let addData = {
            openid: result.data.openid,
            session_key: result.data.session_key,
            session_key_expire: now + result.data.expires_in * 1000,
            unionid: "",
            nickName: "",
            gender: "",
            city: "",
            province: "",
            country: "",
            avatarUrl: ""
          };
          if (result.data.unionid) {
            addData["unionid"] = result.data.unionid;
          }
          ctx.session.user = JSON.stringify({
            openid: addData.openid,
            login_expire: addData.session_key_expire
          });
          await createUser(ctx, addData);
        }
      } else {
        Json.res(ctx, 10003, "微信用户授权失败");
      }
    }
  },
  getUserInfo: async (ctx, next) => {
    let userInfo = JSON.parse(ctx.request.body.sessionUser);
    let user = await User.findOne({
      openid: userInfo.openid
    });
    Json.res(ctx, 200, user);
    if (user) {
      Json.res(ctx, 200, user);
    } else {
      Json.res(ctx, 202, "用户不存在");
    }
  },
  updateInfo: async (ctx, next) => {
    let userInfo = JSON.parse(ctx.request.body.sessionUser);
    let req = ctx.request.body;
    let addData = {
      nickName: req.nickName,
      gender: req.gender,
      city: req.city,
      province: req.province,
      country: req.country,
      avatarUrl: req.avatarUrl
    };
    let update = await User.updateOne(
      {
        openid: userInfo.openid
      },
      {
        $set: addData
      }
    );
    if (update) {
      Json.res(ctx, 200, "更新成功");
    } else {
      Json.res(ctx, 202, "用户不存在");
    }
  }
};
