//TV端账户获取及推送相关api
const api_fyb = require('../../api/api_fyb')
const config = require('../../config/index')

const url_getaccountByMac = config.baseUrl_acct + '/getinfo/getaccount-by-mac'
const url_pushTvLogin = config.baseUrl_acct + '/helper/push_tv_login'

function getTVAcctInfo() { //根据设备mac获取账号信息
  return new Promise((resolve, reject) => {
    wx.request({
      url: url_getaccountByMac,
      data: {
        mac: '2835452AA239',
        deviceId: '31140974'
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

function pushTvLogin() { //小微信程序手动推送TV端登陆
  return new Promise((resolve, reject) => {
    wx.request({
      url: url_pushTvLogin,
      data: {
        openId: '43bce999cf8211e9b3f874a4b5004af8', //需要衡炎炎给？
        deviceId: '31140974'
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