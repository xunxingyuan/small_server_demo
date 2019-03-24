const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  openid: String,
  session_key: String,
  session_key_expire: Number,
  unionid: String,
  nickName: String,
  gender: String,
  city: String,
  province: String,
  country: String,
  avatarUrl: String
});
module.exports = UserSchema;
