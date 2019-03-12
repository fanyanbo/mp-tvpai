var utils = require('../../utils/util.js');
var appJs = require('../../app.js');
var api = require('../../api/api.js')
var app = getApp()

var userDebug = false
var debugCnt = 0
var i1 = 1
var i2 = 1
var i3 = 1

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      nickName: '你好',
      avatarUrl: '../../images/man.png'
    },
    username: '未登录',
    coocaaLogin: true,
    hasArticle: true,
    hasTopic: true,
    hasMovie: true,
    page: 1,
    topicPage: 1,
    moviePage: 1,
    total: '0',
    topicTotal: 0,
    movieTotal: 0,
    pageSize: 10,
    storgeSize: 0,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  userDebug: function () {
    userDebug = true
  },
  webNavigateTo: function () {
    wx.navigateTo({
      url: '../webView/webView'
    })
  },
  bindGetUserInfo: function (e) {
    console.log('bindGetUserInfo:' + this.data.coocaaLogin)
    console.log(e.detail.userInfo)
    if (e.detail.userInfo != undefined) {
      this.setData({
        userInfo: e.detail.userInfo,
        onLine: true
      })
      getApp().globalData.onLine = true
      if (this.data.coocaaLogin) {
        if (utils.ccsessionIs() == null) return
        wx.navigateTo({
          url: '../login/coocaa',
        })
      } else {
        wx.navigateTo({
          url: '../user/user',
        })
      }
    }
    else {
      getApp().globalData.onLine = false
      this.setData({
        onLine: false
      })
    }
  },
  lower2: function (e) {
    var that = this
    if (i3 == that.data.moviePage) {
      if (that.data.moviePage > 1 && that.data.moviePage <= that.data.totalPageMovie) {
        this.getMovie()
      }
      i3++
    }
    return
  },
  upper: function (e) {
  },
  scroll: function (e) {
  },
  handler: function (e) {
    if (e.detail != undefined) {
      app.globalData.auhtSetting = e.detail['authSetting']['scope.userInfo'];
    }
    if (utils.ccsessionIs() == null) return
    if (this.data.coocaaLogin) {
      wx.navigateTo({
        url: '../login/coocaa',
      })
    } else {
      wx.navigateTo({
        url: '../home/home',
      })
    }
  },
  getMovie: function (message) {
    let that = this
    const secret = app.globalData.secret
    const vuid = wx.getStorageSync('deviceId')
    console.log(vuid);
    const params = { "appkey": app.globalData.appkey, "time": app.globalData.time, "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code, "vuid": vuid }
    console.log(params);
    const sign = utils.encryptionIndex(params, secret)
    const url = api.pushhistoryUrl
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
        let streams = res.data.data
        if (streams.length < parseInt(that.data.pageSize)) {
          that.setData({
            column: streams
          })
        } else {
          that.setData({
            column: streams,
            page: parseInt(that.data.page) + 1 + ''
          })
        }
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
    console.log('fyb,授权登陆', this.data.canIUse)
    var that = this
    var ccsession = app.globalData.ccsession
    wx.getSetting({
      success: function (res) {
        console.log('授权登陆,1111111', res.authSetting['scope.userInfo'])
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log('fyb,', res.userInfo)
            }
          })
        }
      }
    })
    console.log('fyb,my.js onload:', ccsession)
    if (ccsession === null || ccsession === '') {
      //重新登录
      wx.login({
        success: function (e) {
          console.log('授权登陆,2222222', e)
          var code = e.code
          wx.getUserInfo({
            success: function (res) {
              console.log('授权登陆,33333333', res)
              var encryptedData = res.encryptedData
              var iv = res.iv;
              var rawData = res.rawData
              var signature = res.signature
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
    else {
      app.getUserInfo();
      var userInfo = app.globalData.userInfo
      if (typeof (userInfo) == "undefined") {
        console.log('get user info failed')
      } else {
        console.log('get user info success')
      }
      getApp().globalData.onLine = true
      that.setData({
        userInfo: userInfo,
        username: wx.getStorageSync("username"),
        onLine: true
      })
    }
    console.log("app.globalData.username", app.globalData.username)
    if (app.globalData.username != '未登录' && app.globalData.username != '') {
      console.log("进来了")
      wx.setStorageSync('username', app.globalData.username)
      that.setData({
        username: app.globalData.username,
        coocaaLogin: false
      })
    } else if (app.globalData.username == '未登录') {
      that.setData({
        username: app.globalData.username,
        coocaaLogin: true,
      })
    } else if (app.globalData.username == '') {
      that.setData({
        username: '未登录',
        coocaaLogin: true,
      })
    }
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({
      success: function (res) {
        console.log("设备信息")
        console.log(res)
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          clientHeight: res.windowHeight - 240
        });
      }
    });
    this.setData({
      movieTotal: 0,
      moviePage: 1,
      movieData: []
    });
    this.getMovie();
  },
  onShareAppMessage: function () {
    return {
      title: '酷影评',
      path: 'pages/my/my'
    }
  },
  onShow: function () {
    var that = this
    userDebug = false
    debugCnt = 0
    console.log('onshow')
    var that = this
    wx.getStorageInfo({
      success: function (res) {
        that.setData({ storgeSize: res.currentSize })
      }
    })
    let key = app.globalData.key
    let ccsession = wx.getStorageSync('cksession')
    let paramsStr = { "ccsession": ccsession }
    let sign = utils.encryption(paramsStr, key)
    wx.request({
      url: api.checkUserUrl,
      method: 'GET',
      data: {
        client_id: app.globalData.client_id,
        sign: sign,
        param: paramsStr
      },
      success: function (res) {
        if (res.data.result && res.data.data != null) {
          console.log("checkUser:", res)
          wx.setStorageSync('userid', res.data.data.userid)
          wx.setStorageSync('username', res.data.data.username)
          wx.setStorageSync('mobile', res.data.data.mobile)
          if (res.data.data.userid === undefined || res.data.data.userid === '' || res.data.data.userid === null) {
            app.globalData.username = '未登录'
            that.setData({
              username: '未登录',
              coocaaLogin: true
            })
          } else {

            app.globalData.username = res.data.data.username
            that.setData({
              username: app.globalData.username,
              coocaaLogin: false
            })
          }
        }
      }
    })
    if (app.globalData.username != '未登录' && app.globalData.username != '') {
      console.log("进来了2")
      that.setData({
        username: app.globalData.username,
        coocaaLogin: false
      })
    } else if (app.globalData.username == '未登录') {
      that.setData({
        username: app.globalData.username,
        coocaaLogin: true
      })
    } else if (app.globalData.username == '') {
      that.setData({
        username: '未登录',
        coocaaLogin: true
      })
    }
    console.log("app.globalData.username")
    console.log(app.globalData.username)
    i1 = 2
    i2 = 2
    i3 = 2
    if (this.data.movieData != null && this.data.movieData.length > 0 && !that.data.coocaaLogin) {
      this.setData({
        movieTotal: 0,
        moviePage: 1,
        movieData: []
      });
      this.getMovie();
    }
  },
  onPullDownRefresh: function () {
    this.setData({
      total: 0,
      page: 1,
      topicTotal: 0,
      topicPage: 1,
      movieTotal: 0,
      moviePage: 1,
      movieData: [],
      topicData: [],
      articleData: []
    })
    this.getMovie()
    wx.stopPullDownRefresh();
  },
  /** 
  * 滑动切换tab 
  */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    console.log(e.currentTarget.dataset.current)
    if (this.data.currentTab === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.current
      })
    }
  },
  noBinds: function (e) {
    var that = this
    if (utils.ccsessionIs() == null) return
    wx.navigateTo({
      url: '../login/coocaa',
    })
  }

})






