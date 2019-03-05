//index.js
var utils = require('../../utils/util.js');
const api = require('../../api/api.js');
//获取应用实例
var app = getApp();
Page({
  data: {
    isShowTips: true,
    page: '0',
    pageSize: '10',
    banner_pageSize:'3',
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    indicatorColor: '#ECECEC',
    indicatorActiveColor: "#FFD71C",
    banners: [],
    column: [],
    list: []
  },
  // 获取一级标签分类
  oneclassify: function (message) {
    let that = this
    const secret = app.globalData.secret
    const params = { "appkey": app.globalData.appkey, "page_index": that.data.page, "page_size": that.data.pageSize, "time": app.globalData.time, "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code}
    console.log(params);
    const sign = utils.encryptionIndex(params, secret)
    const url = api.oneclassifyUrl
    let data = {
      appkey: app.globalData.appkey,
      page_index: that.data.page,
      page_size: that.data.pageSize,
      time: app.globalData.time,
      tv_source: app.globalData.tvSource,
      version_code: app.globalData.version_code,
      sign: sign
    }
    utils.postLoading(url, 'GET', data, function (res){
      console.log("一级粉类")
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
      console.log(res)
    }, message)
  },


  // 首页推荐接口
  twoclassify: function (message) {
    let that = this
    const secret = app.globalData.secret
    const params = { "appkey": app.globalData.appkey, "time": app.globalData.time, "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code}
    console.log(params);
    const sign = utils.encryptionIndex(params, secret)
    const url = api.recommendlistUrl
    let data = {
      appkey: app.globalData.appkey,
      time: app.globalData.time,
      tv_source: app.globalData.tvSource,
      version_code: app.globalData.version_code,
      sign: sign
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log('正片二级分类:')
      console.log(res.data.data)
      if (res.data.data) {
        let recommendlist = res.data.data
        if (recommendlist.length < parseInt(that.data.pageSize)) {
          that.setData({
            list: recommendlist
          })
        } else {
          that.setData({
            list: recommendlist,
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
      console.log(res)
    }, message)
  },

  // 获取轮播图数据
  getBanners: function (message) {
    let that = this
    const url = api.getStreamsUrl
    const key = app.globalData.key
    const page = that.data.page
    const banner_pageSize = that.data.banner_pageSize
    const params = { "page": page, "pageSize": banner_pageSize }
    const sign = utils.encryption(params, key)

    let data = {
      client_id: app.globalData.client_id,
      sign: sign,
      param: params
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log('streams ok:')
      console.log(res)

      let streamsTm = that.data.streams
      if (res.data.result) {
        if (that.data.page == '1') {
          streamsTm = []
        }
        if (parseInt(that.data.page) > res.data.data.pager.totalPage) {
          that.setData({
            hasMoreData: false
          })
          return false
        }
        let streams = res.data.data.list
        if (streams.length < parseInt(that.data.pageSize)) {
          that.setData({
            streams: res.data.data.list,
            hasMoreData: false
          })
        } else {
          that.setData({
            streams: res.data.data.list,
            hasMoreData: true,
          })
        }
      } else {
        wx.showToast({
          title: res.data.message,
        })
      }
    }, function (res) {
      console.log('streams fail:', res)
      wx.showToast({
        title: '加载数据失败',
      })
    }, function (res) {
      console.log('streams complete:', res)
    }, message)
  },



  onLoad(options) {
    console.log('first onLoad监听页面加载');
    let that = this
    that.oneclassify('')
    that.twoclassify('')
    that.getBanners('加载中')
  },

  onReady() {
    console.log('first onReady监听页面初次渲染完成');
  },

  onShow() {
    this.setData({
      isShowTips: app.globalData.isShowTips
    })
    var that = this
    var ccsession = wx.getStorageSync('cksession')
    console.log('首页，onshow,', ccsession)
    if (ccsession === null || ccsession === '') {
      //重新登录
      wx.login({
        success: function (e) {
          var code = e.code
          console.log("wx.login:" + JSON.stringify(e));
          wx.getUserInfo({
            success: function (res) {
              console.log('fyb', res)
              var encryptedData = res.encryptedData
              var iv = res.iv;
              var rawData = res.rawData
              var signature = res.signature
              app.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', res.userInfo)
              typeof cb == "function" && cb(app.globalData.userInfo)
              appJs.login(rawData, code, encryptedData, iv, signature)
              that.setData({
                userInfo: res.userInfo
              })
            }, fail: function () {
              console.log("未获得用户信息")
            }
          })
        }
      })
    } else {
      app.getUserInfo();
      var userInfo = wx.getStorageSync('userInfo')
      console.log('首页，getuserInfo:', userInfo)
      if (typeof (userInfo) == "undefined") {
        console.log('get user info failed')
      } else {
        console.log('get user info success')
      }
      // the code is commented by fyb
      // that.setData({
      //   userInfo: userInfo,
      //   username: wx.getStorageSync("username")
      // })
    }
  },

  onHide() {
    console.log('first onHide监听页面隐藏');
  },

  onUnload() {
    console.log('first onUnload监听页面卸载');
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '酷影评',
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
});

