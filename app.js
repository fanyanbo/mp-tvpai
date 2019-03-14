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
        console.log("----进来了----" + data.data.ccsession)
        var cksession = data.data.ccsession
        wx.setStorageSync('cksession', cksession)
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

function countTime() {
  var count = 0;
  var n = wx.getStorageSync('cksession')
  var i = setInterval(function () {
    var d = new Date()
    if (n === null || n === '') {
      count++;
      console.log(d.toLocaleString() + "失效了")
      if (count == 3) {
        clearInterval(i);
      }
    } else {
      console.log(d.toLocaleString() + "->" + n)
    }
  }, 1000)
}

App({
  WeToast,
  onLaunch: function () {
    wx.getSystemInfo({
      success: res => {
        //导航高度
        this.globalData.navHeight = res.statusBarHeight + 46;
      }, fail(err) {
        console.log(err);
      }
    })
  },
  onLoad: function () {
  },
  onShow: function () {
  },
  getlocalUserSecret: function () {
    var that = this
    wx.getStorage({
      key: 'userSecret',
      success: function (res) {
        if (res.data) {
          console.log('get userSecret from storage:' + res.data)
          that.debug('get userSecret from storage:' + res.data)
          that.globalData.userSecret = res.data
          that.getBindStatus()
        } else {
          wx.removeStorage({
            key: 'userSecret',
            success: function (res) {
              console.log(res.data)
            }
          })
          that.getUserID()
        }
      },
      fail: function () {
        console.log('get userSecret from storage failed')
        that.debug('get userSecret from storage failed')
        that.getUserID()
      }
    })
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
      //重新登录
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
  debug: function (log) {
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    var time = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second + '  '
    var logs = wx.getStorageSync('logs')
    logs.unshift(time + log)
    wx.setStorageSync('logs', logs)
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
    activeid: null, //add by fyb
    isShowTips: true,
    time: Math.round(new Date().getTime() / 1000).toString(),
    appkey: '5cc090ddad6e4544815a0026e9a735a4',
    secret: 'cd8a62acc6164b27a9af4d29de8eeebd',
    tvSource: 'iqiyi',
    version_code:33
  }
})

module.exports = {
  login: login,
  countTime: countTime
}