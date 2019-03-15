let utils = require('utils/util.js');
let api = require('api/api.js');
let { WeToast } = require('components/toast/wetoast.js');

// 使用登录凭证 code 获取 session_key 和 openid
function login(rawData, code, encryptedData, iv, signature) {
  console.log("code：" + code);
  var url = api.getSessionUrl
  var paramsStr = { "appid": "wx35b9e9a99fd089a9", "jscode": code } //wx45e46c7c955eebf1 wx35b9e9a99fd089a9
  var key = getApp().globalData.key
  var sign = utils.encryption(paramsStr, key)
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
      var data = res.data;
      if (data.result) {
        console.log(res)
        console.log(data.data.wxopenid+"----进来了----" + data.data.ccsession)
        var cksession = data.data.ccsession
        var wxopenid = data.data.wxopenid
        wx.setStorageSync('cksession', cksession)
        wx.setStorageSync('wxopenid', wxopenid)
        getApp().globalData.ccsession = cksession
        console.log("setStorageSync cksession:" + cksession)
        decryptUser(rawData, encryptedData, iv, cksession, signature)
        console.log("登录返回数据：")
        console.log(data.data.mobile)
        var mobile = data.data.mobile
        var username = data.data.username
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
  var url = api.getuserinfoUrl
  var key = getApp().globalData.key
  cksession = wx.getStorageSync('cksession')
  rawData = encodeURI(rawData, 'utf-8')
  var paramsStr = { "ccsession": cksession, "encryptedData": encryptedData, "iv": iv, "rawData": rawData, "signature": signature }
  var sign = utils.encryption(paramsStr, key)
  var dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + cksession + '","encryptedData":"' + encryptedData + '","iv":"' + iv + '","rawData":"' + rawData + '","signature":"' + signature + '"}' })
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
  WeToast,
  onLaunch: function () {
  },
  onLoad: function () {
  },
  onShow: function () {
  },
  getUserInfo: function (cb) {
    var that = this
    var tvSource = wx.getStorageSync("tvSource");
    if (tvSource == null || tvSource === '' || tvSource == undefined){
      wx.setStorageSync('tvSource', 'iqiyi')
    }else{
      that.globalData.tvSource = wx.getStorageSync('tvSource')
    }
    var ccsession = wx.getStorageSync("cksession")
    if (ccsession == null || ccsession === '' || ccsession == undefined) {
      console.log("登录状态已过期" + ccsession)
      wx.clearStorageSync(that.globalData.userInfo)
      wx.login({
        success: function (e) {
          var code = e.code
          wx.getUserInfo({
            success: function (res) {
              console.log(res)
              var encryptedData = res.encryptedData
              var iv = res.iv;
              var rawData = res.rawData
              var signature = res.signature
              that.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', res.userInfo)
              typeof cb == "function" && cb(that.globalData.userInfo)
              login(rawData, code, encryptedData, iv, signature)
            },
            fail: function () {
              console.log("未获得用户信息")
            }
          })
        }
      })
    } else {
      that.globalData.username = wx.getStorageSync('username')
      console.log("登录状态没过期")
    }
  },
  globalData: {
    username: wx.getStorageSync("username"),
    mobile: null,
    userInfo: null,
    userSecret: null,
    devicesID: null,
    source: null,
    key: '9acd4f7d5d9b87468575b240d824eb4f',
    client_id: 'applet',
    movieIdsList: '',
    coocaaLogin: false,
    auhtSetting: false,
    ccsession: '',
    onLine: '',
    activeId: null, //语音遥控推送使用
    deviceId: null, //影片推送使用
    isShowTips: true,
    time: Math.round(new Date().getTime() / 1000).toString(),
    appkey: '5cc090ddad6e4544815a0026e9a735a4',
    secret: 'cd8a62acc6164b27a9af4d29de8eeebd',
    tvSource: 'iqiyi',
    version_code:33
  }
})

module.exports = {
  login: login
}