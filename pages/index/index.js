const utils = require('../../utils/util');
const utils_fyb = require('../../utils/util_fyb');
const api_fyb = require('../../api/api_fyb');
const api = require('../../api/api');
const appJs = require('../../app');
const app = getApp();

Page({
  data: {
    searchContent: '搜索视频、影评或话题',
    isShowTips: true,
    page: '0',
    pageSize: '30',
    banner_pageSize:'3',
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    indicatorColor: '#ECECEC',
    indicatorActiveColor: "#FFD71C",
    banners: [],
    column1: [],
    column2: [],
    column3: [],
    list: [],
    previousmargin: '20rpx',//前边距
    nextmargin: '40rpx',//后边距
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
      var column1 = []
      var column2 = []
      var column3 = []
      if (res.data.data) {
        let streams = res.data.data
        for (var k = 0; k < 10; k++) {
          column1.push(res.data.data[k])
        }
        for (var i = 10; i < 20; i++) {
          column2.push(res.data.data[i])
        }
        for (var n = 20; n < 30; n++) {
          column3.push(res.data.data[n])
        }
        that.setData({
          column1: column1,
          column2: column2,
          column3: column3
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
      console.log(res)
    }, message)
  },
  tagClick: function (e) {
    // 标签点击搜索 跳到search
    var categoryId = e.currentTarget.dataset.category
    var title = e.currentTarget.dataset.title
    wx.navigateTo({
      url: '../sresult/sresult?category_id=' + categoryId + '&title=' + title
    })
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
    console.log('fyb',url);
    console.log('fyb',data);
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
      console.log('streams ok:', res)

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
        if (res.data.data.list){
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

  onLoad() {
    console.log('首页 onLoad监听页面加载');
    this.getBindedDevice();
    this.oneclassify('');
    this.twoclassify('');
    this.getBanners('加载中');
  },

  onReady() {
    console.log('首页 onReady监听页面初次渲染完成');
  },

  onShow() {
    this.setData({
      isShowTips: app.globalData.isShowTips
    })
    let that = this
    let ccsession = wx.getStorageSync('cksession')
    console.log("判断登录状态是否过期")
    console.log(ccsession)
    // if (ccsession === null || ccsession === '') {
    //   wx.login({
    //     success: function (res) {
    //       const code = res.code;
    //       console.log("wx.login", JSON.stringify(res));
    //       wx.getUserInfo({
    //         success: function (res) {
    //           console.log('wx.getUserInfo', res)
    //           let encryptedData = res.encryptedData;
    //           let iv = res.iv;
    //           let rawData = res.rawData;
    //           let signature = res.signature;
    //           app.globalData.userInfo = res.userInfo;
    //           wx.setStorageSync('userInfo', res.userInfo);
    //           typeof cb == "function" && cb(app.globalData.userInfo);
    //           appJs.login(rawData, code, encryptedData, iv, signature);
    //         }, 
    //         fail: function (err) {
    //           console.log("获取用户信息失败");
    //       }})
    //     }
    //   })
    // } else {
    //   // 意义何在？
    //   app.getUserInfo();
    //   console.log('首页，getuserInfo:', wx.getStorageSync('userInfo'));
    // }
  },
  onHide() {
    console.log('首页 onHide');
  },
  onUnload() {
    console.log('首页 onUnload');
  },
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
  },
  handleSearchTap: function () {
    console.log('跳转至搜索页面');
    wx.navigateTo({
      url: '../../pages/search/index',
    });
  },
  getBindedDevice: function () {
    console.log('首页获取并重设当前绑定设备信息');
    let ccsession = wx.getStorageSync('cksession');
    let params = { ccsession: ccsession };
    let desParams = utils_fyb.paramsAssemble_wx(params);
    console.log('getBindDeviceList params', desParams);
    utils_fyb.request(api_fyb.getBindDeviceListUrl, 'GET', desParams,
      function (res) {
        console.log('getBindDeviceList success', res.data);
        if (res.data.data) {
          for (let i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].bindStatus === 1) {
              app.globalData.activeId = res.data.data[i].device.serviceId;
              app.globalData.deviceId = res.data.data[i].deviceId + '',
              console.log('当前绑定的设备信息: activeId = ' + app.globalData.activeId + ", deviceId = " + app.globalData.deviceId);
              break;
            }
          }
        }
      },
      function (res) {
        console.log('getBindDeviceList error', res)
      },
      function (res) {
        console.log('getBindDeviceList complete')
      })
  }
});

