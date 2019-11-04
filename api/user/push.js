//TV端账户获取及推送相关api
const api_fyb = require('../../api/api_fyb')
const config = require('../../config/index')

const url_getaccountByMac = config.baseUrl_acct + '/getinfo/getaccount-by-mac'
const url_pushTvLogin = config.baseUrl_acct + '/helper/push_tv_login'

function getTVAcctInfo(params) { //根据设备mac获取账号信息
  return new Promise((resolve, reject) => {
    wx.request({
      url: url_getaccountByMac,
      data: {
        accessToken: params.accessToken,
        mac: params.mac, //'2835452AA239',   
        deviceId: params.deviceId, //'31140974' //设备激活id
      },
      success(data) {
        console.log(data)
        if(data.data.code == 1 && !!data.data.data) {
          resolve(data.data.data)
        }else {
          reject(data.data.msg)
        }
      },
      fail(data) {
        console.log(data)
        reject(data)
      },
      complete(data) {
        // console.log(data)
      }
    })
  })
}

function pushTvLogin(params) { //小微信程序手动推送TV端登陆
  return new Promise((resolve, reject) => {
    wx.request({
      url: url_pushTvLogin,
      data: {
        // openId: params.openId, //酷开账号openid
        accessToken: params.accessToken,
        deviceId: params.deviceId,//'31140974' //设备激活id
      },
      success(data) {
        console.log(data)
        resolve(data)
      },
      fail(data) {
        console.log(data)
        reject(data)
      },
      complete(data) {
        // console.log(data)
      }
    })
  })
}

module.exports = {
  getTVAcctInfo,
  pushTvLogin  
}