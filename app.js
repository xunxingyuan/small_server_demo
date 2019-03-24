const Koa = require("koa");
const app = new Koa();
// const views = require('koa-views')
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");

const index = require("./routes/index");
const users = require("./routes/users");

const session = require("koa-session2");
const store = require("./src/tools/store");

// error handler
onerror(app);

//数据库
require("./src/db/index");

//微信初始化
require("./src/wechat/index");

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"]
  })
);
app.use(json());
app.use(logger());

const redisStore = new store();

//session
app.use(
  session({
    key: "SESSIONID", //default "koa:sess"
    store: redisStore, //添加 store 配置项
    maxAge: 60 * 60 * 1000 //设置session超时时间,
  })
);
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Credentials", true);
  let id = ctx.request.header["xtoken"];
  let data = await redisStore.get(id);
  console.log(data);
  if (data) {
    ctx.request.body.sessionUser = data.user;

    await next();
  } else {
    if (ctx.url === "/users/login") {
      await next();
    } else {
      ctx.body = {
        code: 10005,
        msg: "未登录或者session过期，请重新登录"
      };
    }
  }
});

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
