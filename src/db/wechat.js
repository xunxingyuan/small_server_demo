const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Wechat = new Schema({
  name: String,
  access_token: String,
  expires_in: Number
});
module.exports = Wechat;
