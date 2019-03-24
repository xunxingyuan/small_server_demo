const router = require("koa-router")();
const users = require("../src/controller/users/index");

router.prefix("/users");

router.post("/login", async function(ctx, next) {
  await users.auth.login(ctx, next);
});

router.get("/info", async function(ctx, next) {
  await users.auth.getUserInfo(ctx, next);
});

router.post("/update", async function(ctx, next) {
  await users.auth.updateInfo(ctx, next);
});

module.exports = router;
