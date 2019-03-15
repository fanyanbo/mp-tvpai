const utils = require('../../utils/util.js');
const appJs = require('../../app.js');
const api = require('../../api/api.js')
const app = getApp()

Page({
  data: {
    userInfo: {
      nickName: '你好',
      avatarUrl: '../../images/man.png'
    },
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  getMovie: function (message) {
    let that = this
    const secret = app.globalData.secret
    const vuid = wx.getStorageSync('cksession')
    console.log(vuid);
    const params = { "appkey": app.globalData.appkey, "time": app.globalData.time, "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code, "vuid": vuid }
    console.log(params);
    const sign = utils.encryptionIndex(params, secret)
    const url = api.pushhistorylistUrl
    let data = {
      appkey: app.globalData.appkey,
      vuid: vuid,
      time: app.globalData.time,
      tv_source: app.globalData.tvSource,
      version_code: app.globalData.version_code,
      sign: sign
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log("推送历史")
      console.log(res.data.data)
      if (res.data.data) {
        let streams = res.data.data
        that.setData({
          historyList: streams
        })
      } else {
        wx.showToast({
          title: res.data.message,
        })
      }
    }, function (res) {
      console.log('streams fail:')
      console.log(res)
      wx.showToast({
        title: '加载数据失败',
      })
    }, function (res) {
      console.log('streams complete:')
    }, '')
  },
  onLoad: function () {
    console.log('onload', this.data.canIUse)
    let that = this
    let ccsession = wx.getStorageSync('cksession');
    wx.getSetting({
      success: function (res) {
        console.log('用户基本信息获取权限', res.authSetting['scope.userInfo'])
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              console.log('用户基本信息', res.userInfo)
              that.setData({ userInfo: res.userInfo })
            }
          }
          )
        }
      }
    })
    if (ccsession == null || ccsession === '') {
      wx.login({
        success: function (e) {
          let code = e.code
          wx.getUserInfo({
            success: function (res) {
              let encryptedData = res.encryptedData
              let iv = res.iv;
              let rawData = res.rawData
              let signature = res.signature
              app.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', app.globalData.userInfo)
              typeof cb == "function" && cb(app.globalData.userInfo)
              appJs.login(rawData, code, encryptedData, iv, signature)
              getApp().globalData.onLine = true
              that.setData({
                userInfo: res.userInfo,
                onLine: true
              })
            }
          })
        }
      })
    }
    this.getMovie();
  },
  onShareAppMessage: function () {
  },
  jumpurl: function (e) {
    let ccsession = wx.getStorageSync("cksession")
    console.log("jumpurl ccsession:" + ccsession);
    if (ccsession != null && ccsession != undefined && ccsession !== '') {
      var type = e.currentTarget.dataset.type
      console.log(type)
      if (type == "home") {
        wx.navigateTo({
          url: '../home/home',
        })
      } else if (type == "history") {
        wx.navigateTo({
          url: '../home/home',
        })
      }
    } else {
      wx.login({
        success: function (res) {
          const code = res.code;
          console.log("wx.login", JSON.stringify(res));
          wx.getUserInfo({
            success: function (res) {
              console.log('wx.getUserInfo', res)
              let encryptedData = res.encryptedData;
              let iv = res.iv;
              let rawData = res.rawData;
              let signature = res.signature;
              app.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', res.userInfo);
              typeof cb == "function" && cb(app.globalData.userInfo);
              appJs.login(rawData, code, encryptedData, iv, signature);
            },
            fail: function (err) {
              console.log("获取用户信息失败");
            }
          })
        }
      })
    }
  },
  onShow: function () {
    console.log('onshow')
  },
  onPullDownRefresh: function () {
    this.getMovie()
    wx.stopPullDownRefresh();
  },
})






