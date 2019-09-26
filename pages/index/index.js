const utils_fyb = require('../../utils/util_fyb')
const api_fyb = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    searchContent: '搜索视频、影评或话题',
    errIconUrl: '../../images/close_icon.png',
    isShowTips: true,
    bIphoneFullScreenModel: false,
    pageSize: '30',
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 600,
    circular: true,
    indicatorColor: '#ECECEC',
    indicatorActiveColor: "#FFD71C",
    banners: [],
    column1: [],
    column2: [],
    column3: [],
    recommandList: [],
    previousmargin: '30rpx',
    nextmargin: '30rpx',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    type: '',
    movieName: '沉默的教室',
    movieNum: 10
  },
  swiperChange: function () {
    console.log('swiperChange')
  },
  // 获取标签分类
  getLabelClassify: function () {
    console.log("当前设备视频源（未绑定时默认为iqiyi):" + utils_fyb.getTvsource());
    let that = this
    let params = { "page_index": '0', "page_size": '30' };
    let desParams = utils_fyb.paramsAssemble_tvpai(params);
    utils_fyb.request(api_fyb.getOneClassifyUrl, 'GET', desParams,
      function (res) {
        console.log('获取标签分类数据:', res.data);
        let column1 = [], column2 = [], column3 = []
        if (utils_fyb.getTvsource() == "iqiyi") {
          if (res.data.data) {
            for (let i = 0; i < 30; i++) {
              if (i < 10) {
                column1.push(res.data.data[i])
              } else if (i >= 10 && i < 20) {
                column2.push(res.data.data[i])
              } else {
                column3.push(res.data.data[i])
              }
            }
            that.setData({
              column1: column1,
              column2: column2,
              column3: column3,
              type: "iqiyi"
            })
          } else {
            wx.showToast({
              title: res.data.message,
            })
          }
        } else {
          if (res.data.data) {
            that.setData({
              column: res.data.data,
              type: "qq"
            })
          } else {
            wx.showToast({
              title: res.data.message,
            })
          }
        }

      },
      function (res) {
        console.log('获取标签分类数据发生错误', res)
        utils_fyb.showFailedToast('加载数据失败', that.data.errIconUrl)
      }
    );
  },
  // 点击一级分类，跳转
  handleCategoryTap: function (e) {
    let categoryId = e.currentTarget.dataset.category;
    let title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../sresult/sresult?category_id=' + categoryId + '&title=' + title
    });
  },
  // 获取首页推荐分类和影片
  getRecommendClassify: function () {
    let that = this;
    utils_fyb.request(api_fyb.getRecommendListUrl, 'GET', utils_fyb.paramsAssemble_tvpai(),
      function (res) {
        console.log('获取推荐分类及影片数据:', res.data.data)
        if (res.data.data) {
          that.setData({
            recommandList: res.data.data
          })
        } else {
          wx.showToast({
            title: res.data.message,
          })
        }
      },
      function (res) {
        console.log('获取推荐分类及影片数据发生错误', res)
        utils_fyb.showFailedToast('加载数据失败', that.data.errIconUrl)
      }
    );
  },
  // 获取轮播图数据
  getBannerData: function () {
    let that = this;
    let params = { "page": '0', "pageSize": '3' }
    let desParams = utils_fyb.paramsAssemble_wx(params);
    utils_fyb.request(api_fyb.getBannerDataUrl, 'GET', desParams,
      function (res) {
        console.log('获取轮播图数据:', res.data);
        if (res.data.result) {
          if (res.data.data.pager.totalPage < 0) {
            return false
          }
          let streams = res.data.data.list
          if (res.data.data.list) {
            if (streams.length < parseInt(that.data.pageSize)) {
              that.setData({
                streams: res.data.data.list
              })
            } else {
              that.setData({
                streams: res.data.data.list
              })
            }
          }
        } else {
          wx.showToast({
            title: res.data.message,
          })
        }
      },
      function (res) {
        console.log('获取轮播图数据发生错误', res);
        utils_fyb.showFailedToast('加载数据失败', that.data.errIconUrl)
      }
    )
  },

  onLoad() {
    console.log('onLoad')

  },

  onReady() {
    console.log('onReady')
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // custom模式测试，在真机上screenHeight和windowHeight高度一样，导致marginTop为0；模拟器上正常
        let screenHeight = res.screenHeight;
        let windowHeight = res.windowHeight;
        let marginTop = screenHeight - windowHeight;
        console.log("marginTop", marginTop)
      }
    })
  },

  onShow() {
    console.log('onShow')
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    })
    this.getBannerData()
    this.getBindedDevice()
    this.getLabelClassify()
    this.getRecommendClassify()
    //TabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  onHide() {
    console.log('onHide')
  },

  onUnload() {
    console.log('onUnload')
  },

  // 分享转发
  onShareAppMessage: function (res) {
    return {
      title: '电视派',
      path: 'pages/index/index',
      success: function (res) { },
      fail: function (res) { }
    }
  },

  // 跳转至搜索页面
  handleSearchTap: function () {
    wx.navigateTo({
      url: '../search/index',
    });
  },

  // 跳转至片单详情页
  handleTopicTap: function (e) {
    console.log('handleTopicTap', e)
    // wx.navigateTo({
    //   url: `../webview/webview?title=${e.currentTarget.dataset.title}`,
    // });
    wx.navigateTo({
      url: `../topic/topic?title=${e.currentTarget.dataset.title}`,
    });
  },

  // 点击banner跳转，这里不用获取用户授权，不用获取session值，因为影评内的收藏无法使用
  jumpFind(e) {
    console.log('jumpFind ccsession', wx.getStorageSync("new_cksession"));
    if (e.currentTarget.dataset.type == 'cinecism') {
      wx.navigateTo({
        url: '../../pages/cinecism/cinecism?id=' + e.currentTarget.dataset.id,
      })
    } else if (e.currentTarget.dataset.type == 'find') {
      wx.navigateTo({
        url: '../../pages/find/find',
      })
    }
  },

  getBindedDevice: function () {
    let ccsession = wx.getStorageSync('new_cksession');
    console.log('监测当前是否有session值（无则获取不到绑定设备列表):', ccsession);
    if (ccsession == null || ccsession === "") return;
    let params = { ccsession: ccsession };
    let desParams = utils_fyb.paramsAssemble_wx(params);
    console.log('getBindedDevice params', desParams);
    console.log('getBindedDevice url', api_fyb.getBindDeviceListUrl);
    utils_fyb.request(api_fyb.getBindDeviceListUrl, 'GET', desParams,
      function (res) {
        console.log('获取绑定设备列表：', res.data);
        if (res.data.data) {
          wx.setStorageSync('deviceId', '');
          app.globalData.activeId = null;
          app.globalData.deviceId = null;
          for (let i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].bindStatus === 1) {
              app.globalData.activeId = res.data.data[i].device.serviceId;
              app.globalData.deviceId = res.data.data[i].deviceId + '',
                wx.setStorageSync('deviceId', res.data.data[i].deviceId + '');
              console.log('getBindedDevice: activeId = ' + app.globalData.activeId + ", deviceId = " + app.globalData.deviceId);
              break;
            }
          }
        } else {
          wx.setStorageSync('deviceId', '');
          app.globalData.activeId = null;
          app.globalData.deviceId = null;
        }
        utils_fyb.refreshBindedTVStatus(app.globalData.activeId);
      },
      function (res) {
        console.log('获取绑定设备列表发生错误', res)
        utils_fyb.refreshBindedTVStatus(app.globalData.activeId);
      }
    )
  }
});
