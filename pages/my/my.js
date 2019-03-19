const utils = require('../../utils/util.js');
const utils_fyb = require('../../utils/util_fyb');
const api = require('../../api/api.js');
const app = getApp();

Page({
  data: {
    userInfo: {
      nickName: '你好',
      avatarUrl: '../../images/man.png'
    },
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  getMovie: function () {
    let that = this
    const secret = app.globalData.secret
    const vuid = wx.getStorageSync('wxopenid')
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
      console.log(res)
      if (res.data.data) {
        let withinList = res.data.data.movies_within_serven_days
        let overList = res.data.data.movies_over_serven_days
        if (withinList.length == 0) {
          that.setData({
            historyList: overList
          })
        } else {
          that.setData({
            historyList: withinList
          })
        }
      }
    }, function (res) {
      console.log('streams fail:',res)
      wx.showToast({
        title: '加载数据失败',
      })
    }, function (res) {
      console.log('streams complete')
    }, '')
  },
  onLoad: function () {
    this.getMovie();
  },
  onShow: function () {
  },
  onPullDownRefresh: function () {
    this.getMovie()
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function () {
  },
  bindGetUserInfo(e) {
    let that = this;
    console.log('canIUse', this.data.canIUse, e)
    let ccsession = wx.getStorageSync("cksession");
    console.log('bindGetUserInfo ccsession', ccsession);
    if (ccsession == null || ccsession === '') {
      wx.login({
        success: function (res) {
          console.log('code', res);
          utils_fyb.getSessionByCode(res.code, function (res) {
            console.log('success', res);
            if (res.data.result && res.data.data) {
              let ccsession = res.data.data.ccsession;
              let wxopenid = res.data.data.wxopenid;
              wx.setStorageSync('cksession', ccsession);
              wx.setStorageSync('wxopenid', wxopenid);
              console.log('setStorage, session = ' + ccsession + ',openid = ' + wxopenid);
              if (e.currentTarget.dataset.type == 'home') {
                that.jumpHomePage();
              } else if (e.currentTarget.dataset.type == 'history') {
                that.jumpHistoryPage();
              }
            }
          }, function (res) {
            console.log('error', res)
          });
        }
      });
    } else {
      if (e.currentTarget.dataset.type == 'home') {
        that.jumpHomePage();
      } else if (e.currentTarget.dataset.type == 'history') {
        that.jumpHistoryPage();
      }
    }
  },
  // 跳转设备绑定页面
  jumpHomePage: function () {
    wx.navigateTo({
      url: '../home/home',
    })
  },
  // 跳转播放历史页面
  jumpHistoryPage: function () {
    wx.navigateTo({
      url: '../history/history',
    })
  },
    // jumpurl: function (e) {
  //   let ccsession = wx.getStorageSync("cksession")
  //   console.log("jumpurl ccsession:" + ccsession);
  //   if (ccsession != null && ccsession != undefined && ccsession !== '') {
  //     var type = e.currentTarget.dataset.type
  //     if (type === "home") {
  //       wx.navigateTo({
  //         url: '../home/home',
  //       })
  //     } else if (type === "history") {
  //       wx.navigateTo({
  //         url: '../history/history',
  //       })
  //     }
  //   } else {
  //     wx.login({
  //       success: function (res) {
  //         const code = res.code;
  //         console.log("wx.login", JSON.stringify(res));
  //         wx.getUserInfo({
  //           success: function (res) {
  //             console.log('wx.getUserInfo', res)
  //             let encryptedData = res.encryptedData;
  //             let iv = res.iv;
  //             let rawData = res.rawData;
  //             let signature = res.signature;
  //             app.globalData.userInfo = res.userInfo;
  //             wx.setStorageSync('userInfo', res.userInfo);
  //             typeof cb == "function" && cb(app.globalData.userInfo);
  //             appJs.login(rawData, code, encryptedData, iv, signature);
  //           },
  //           fail: function (err) {
  //             console.log("我的页面，获取用户信息失败", err);
  //           }
  //         })
  //       }
  //     })
  //   }
  // },
})






