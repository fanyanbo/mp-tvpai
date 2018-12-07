//app.jss

var utils = require('utils/util.js');
let { WeToast } = require('toast/wetoast.js')

// 使用登录凭证 code 获取 session_key 和 openid
function login(rawData, code, encryptedData, iv, signature) {
  var url = getApp().globalData.ROOTUrl + 'appletAPI/getSession.coocaa'
  var paramsStr = { "appid": "wx45e46c7c955eebf1", "jscode": code }
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
        console.log("进来了")

        var cksession = data.data.ccsession
        console.log("返回数据")
        console.log(data)
        wx.setStorageSync('cksession', cksession)
        getApp().globalData.ccsession = cksession
        //定时器判断ccsession是否失效
        //countTime()
        console.log("setStorageSync cksession:" + cksession)
        decryptUser(rawData, encryptedData, iv, cksession, signature)
        console.log("登录返回数据：")
        console.log(data.data.mobile)
        var mobile = data.data.mobile
        var username = data.data.username
        //把mobile和username存下来
        wx.setStorageSync('mobile', mobile)
        wx.setStorageSync('username', username)
        console.log(mobile)
        utils.showToastBox("成功", "success")
      }
    },
    fail: function () {
      console.log("使用登录凭证 code 获取 session_key 和 openid失败")
    }
  })
}

//解密获取用户数据
function decryptUser(rawData, encryptedData, iv, cksession, signature) {
  var url = getApp().globalData.ROOTUrl + 'appletAPI/getuserinfo.coocaa'
  var key = getApp().globalData.key
  cksession = wx.getStorageSync('cksession')
  // console.log("getStorageSync cksession:" + cksession)
  rawData = encodeURI(rawData, 'utf-8')
  var paramsStr = { "ccsession": cksession, "encryptedData": encryptedData, "iv": iv, "rawData": rawData, "signature": signature }
  var sign = utils.encryption(paramsStr, key)
  //console.log("cksession" + cksession)
  var dataStr = utils.json2Form({ client_id: 'applet', sign: sign, param: '{"ccsession":"' + cksession + '","encryptedData":"' + encryptedData + '","iv":"' + iv + '","rawData":"' + rawData + '","signature":"' + signature + '"}' })
  wx.request({
    url: url,
    data: dataStr,
    method: 'post',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: res => {
      var data = res.data;
      console.log(data.message)
    },
    fail: function () {
      console.log("解密用户信息失败!")
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
      console.log(d.toLocaleString() + "---------------失效了")
      if (count == 3) {
        clearInterval(i);
      }
    } else {
      console.log(d.toLocaleString() + "---------------" + n)
    }
  }, 1000)
}


App({
  WeToast,
  onLaunch: function () {
    var that = this

    // that.globalData.source = wx.getStorageSync('source')

    //调用API从本地缓存中获取数据
    wx.getStorageInfo({
      success: function (res) {

      }
    })
  },
  onLoad: function () {

  },
  onShow: function () {
    this.getUserInfo()
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
    // wx.clearStorageSync(that.globalData.userInfo)
    wx.checkSession({
      success: function (res) {
        that.globalData.username = wx.getStorageSync('username')
        console.log("登录状态没过期")
        console.log(res)
      },
      fail: function (res) {
        console.log("登录状态已过期")
        wx.clearStorageSync(that.globalData.userInfo)
        //重新登录
        wx.login({
          success: function (e) {
            // console.log(e)
            var code = e.code
            wx.getUserInfo({
              success: function (res) {
                console.log(res)
                var encryptedData = res.encryptedData
                var iv = res.iv;
                var rawData = res.rawData
                var signature = res.signature
                that.globalData.userInfo = res.userInfo
                wx.setStorageSync('that.globalData.userInfo', that.globalData.userInfo)
                typeof cb == "function" && cb(that.globalData.userInfo)
                login(rawData, code, encryptedData, iv, signature)
              }
            })
          }
        })
      }
    })
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
    // console.log(time)

    var logs = wx.getStorageSync('logs') || []
    logs.unshift(time + log)
    wx.setStorageSync('logs', logs)
  },
  globalData: {
    ROOTUrl: 'https://tvpi.coocaa.com',
    username: wx.getStorageSync("username"),
    mobile: null,
    userInfo: null,
    userSecret: null,
    devicesID: null,
    source: null,
    appkey: '5cc090ddad6e4544815a0026e9a735a4',
    secret:'cd8a62acc6164b27a9af4d29de8eeebd',
    client_id: 'applet',
    movieIdsList: '',
    coocaaLogin: false,
    ccsession: '',
    time: Math.round(new Date().getTime() / 1000).toString()
  }
})




module.exports = {
  login: login,
  countTime: countTime
}