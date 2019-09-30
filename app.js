const utils = require('utils/util.js');
const api = require('api/api.js');
const utils_fyb = require('utils/util_fyb.js');

// 使用登录凭证 code 获取 session_key 和 openid
function login(rawData, code, encryptedData, iv, signature) {
  console.log("code：" + code);
  let url = api.getSessionUrl
  let paramsStr = { "appid": "wx35b9e9a99fd089a9", "jscode": code } //wx45e46c7c955eebf1 wx35b9e9a99fd089a9
  let key = getApp().globalData.key
  let sign = utils.encryption(paramsStr, key)
  wx.request({
    url: url,
    data: {
      client_id: 'applet',
      sign: sign,
      param: paramsStr
    },
    method: 'get',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: res => {
      let data = res.data;
      if (data.result) {
        console.log(res)
        console.log(data.data.wxopenid+"----进来了----" + data.data.ccsession)
        let cksession = data.data.ccsession
        let wxopenid = data.data.wxopenid
        wx.setStorageSync('new_cksession', cksession)
        wx.setStorageSync('wxopenid', wxopenid)
        getApp().globalData.new_cksession = cksession
        console.log("setStorageSync cksession:" + cksession)
        decryptUser(rawData, encryptedData, iv, cksession, signature)
        console.log("登录返回数据：")
        console.log(data.data.mobile)
        let mobile = data.data.mobile
        let username = data.data.username
        wx.setStorageSync('mobile', mobile)
        wx.setStorageSync('username', username)
        wx.setStorageSync('userid', data.data.userid)
      }
    },
    fail: function () {
      console.log("使用登录凭证 code 获取 session_key 和 openid失败")
    }
  })
}

//解密获取用户数据
function decryptUser(rawData, encryptedData, iv, cksession, signature) {
  let url = api.getuserinfoUrl
  let key = getApp().globalData.key
  cksession = wx.getStorageSync('new_cksession')
  rawData = encodeURI(rawData, 'utf-8')
  let paramsStr = { "ccsession": cksession, "encryptedData": encryptedData, "iv": iv, "rawData": rawData, "signature": signature }
  let sign = utils.encryption(paramsStr, key)
  let dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + cksession + '","encryptedData":"' + encryptedData + '","iv":"' + iv + '","rawData":"' + rawData + '","signature":"' + signature + '"}' })
  wx.request({
    url: url,
    data: dataStr,
    method: 'post',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: res => {
      console.log('解密用户信息成功', res)
    },
    fail: function () {
      console.log("解密用户信息失败")
    }
  })
}

App({
  onLaunch: function () {
    console.log('onLaunch.')
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.bIphoneFullScreenModel = utils_fyb.checkIphoneFullScreenModel({ platform: res.platform, model: res.model })
        console.log('bIphoneFullScreenModel: ', that.globalData.bIphoneFullScreenModel)
      },
    })
  },
  globalData: {
    username: wx.getStorageSync("username"),
    mobile: null,
    key: '9acd4f7d5d9b87468575b240d824eb4f',
    client_id: 'applet',
    new_cksession: '',
    activeId: null, //语音遥控推送使用
    deviceId: null, //影片推送使用
    isShowTips: true, //遥控器提示栏
    time: () => {return Math.round(new Date().getTime() / 1000).toString();},
    appkey: '5cc090ddad6e4544815a0026e9a735a4',
    secret: 'cd8a62acc6164b27a9af4d29de8eeebd',
    version_code: 33,
    bIphoneFullScreenModel:false,
    sourceChanged: true //源是否被改变，初始化默认被改变
  }
})

module.exports = {
  login: login
}