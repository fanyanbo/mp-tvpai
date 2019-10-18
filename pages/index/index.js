const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    errIconUrl: '../../images/close_icon.png',
    isShowTips: true,
    bIphoneFullScreenModel: false,
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 600,
    circular: true,
    indicatorColor: '#ECECEC',
    indicatorActiveColor: "#FFD71C",
    column: [],
    column1: [],
    column2: [],
    column3: [],
    recommandList: [],
    previousmargin: '30rpx',
    nextmargin: '30rpx',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    source: utils.getTvsource(), 
    topicList: [],
    bannerList: []
  },

  swiperChange: function () {
    console.log('swiperChange')
  },

  // 获取标签分类
  getLabelClassify: function () {
    console.log("当前设备视频源（未绑定时默认为iqiyi):" + this.data.source);
    let params = { "page_index": '0', "page_size": '30' };
    let desParams = utils.paramsAssemble_tvpai(params);
    utils.requestP(api.getOneClassifyUrl, desParams).then(res => {
      console.log('获取标签分类数据:', res.data)
      if (res.data.data) {
        if(utils.getTvsource() === "iqiyi") {
          let _column1 = [], _column2 = [], _column3 = []
          for (let i = 0; i < 30; i++) {
            if (i < 10) {
              _column1.push(res.data.data[i])
            } else if (i >= 10 && i < 20) {
              _column2.push(res.data.data[i])
            } else {
              _column3.push(res.data.data[i])
            }
          }
          this.setData({
            column1: _column1,
            column2: _column2,
            column3: _column3,
            source: "iqiyi"
          })
        } else {
          this.setData({
            column: res.data.data,
            source: "qq"
          })
        }
      } else {
        console.log('获取标签分类数据失败:', res)
        // utils.showFailedToast(res.data.message, this.data.errIconUrl)
      }
    }).catch(res => {
      console.log('获取标签分类数据发生错误', res)
      // utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 获取推荐分类和影片
  getRecommendClassify: function () {
    utils.requestP(api.getRecommendListUrl, utils.paramsAssemble_tvpai())
      .then(res => {
        console.log('获取推荐分类及影片数据:', res.data.data)
        if (res.data.data) {
          this.setData({
            recommandList: res.data.data
          })
        } else {
          console.log('获取推荐分类及影片失败:', res)
          // utils.showFailedToast(res.data.message, this.data.errIconUrl)
        }
      }).catch(res => {
        console.log('获取推荐分类及影片数据发生错误:', res)
        // utils.showFailedToast('加载数据失败', this.data.errIconUrl)
      })
  },

  // 获取banner数据
  getBannerData: function () {
    let params = { "clientType": app.globalData.platform }
    let desParams = utils.paramsAssemble_wx(params);
    utils.requestP(api.getBannerDataUrl, desParams).then(res => {
      console.log('获取banner数据:', res.data)
      if (res.data && res.data.code === 200) {
        this.setData({
          bannerList: res.data.data
        })
      } else {
        console.log('获取banner数据失败', res)
        // utils.showFailedToast(res.data.message || '加载数据失败', this.data.errIconUrl)
      }
    }).catch(res => {
      console.log('获取轮播图数据发生错误', res)
      // utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  // 获取片单数据，片单不区分源
  getTopicData: function () {
    utils.requestP(api.getTopicUrl, utils.paramsAssemble_tvpai()).then(res => {
      console.log('获取片单数据:', res)
      if (res.data.data) {
        this.setData({
          topicList: res.data.data
        })
      }
    }).catch(res => {
      console.log('获取片单数据发生错误', res)
      // utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  onLoad() {
    //console.log('onLoad')
    // 不区分源，所以在此处调用
    this.getBannerData()
    this.getTopicData()
  },

  onReady() {
    //console.log('onReady')
    wx.getSystemInfo({
      success: function (res) {
        console.log("custom模式测试",res);
        // custom模式测试，在真机上screenHeight和windowHeight高度一样，导致marginTop为0；模拟器上正常
        let screenHeight = res.screenHeight;
        let windowHeight = res.windowHeight;
        let marginTop = screenHeight - windowHeight;
        console.log("marginTop", marginTop)
      }
    })
  },

  onShow() {
    //console.log('onShow')
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    })  
    this.getBindedDevice()
    // 调用优化
    if(app.globalData.sourceChanged) {
      app.globalData.sourceChanged = false
      this.getLabelClassify()
      this.getRecommendClassify()
    }
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
    wx.navigateTo({
      url: `../topicDetail/topicDetail?id=${e.currentTarget.dataset.id}`,
    });
  },

  // 点击一级分类，跳转
  handleCategoryTap: function (e) {
    let categoryId = e.currentTarget.dataset.category;
    let title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../sresult/sresult?category_id=' + categoryId + '&title=' + title
    });
  },

  // 点击banner跳转，这里不用获取用户授权，不用获取session值，因为影评内的收藏无法使用
  handleBannerTap: function (e) {
    console.log('handleBannerTap', e)
    let {type, url} = e.currentTarget.dataset
    type = 2
    url = "https://www.baidu.com"
    if(type === 1) { // type 1:小程序 2:外链
      wx.navigateTo({
        url: `../${url}`
      })
    } else if(type === 2) {  
      wx.navigateTo({
        url: `../webview/webview?path=${url}`
      });
    }
    // if (e.currentTarget.dataset.type == 'cinecism') {
    //   wx.navigateTo({
    //     url: '../cinecism/cinecism?id=' + e.currentTarget.dataset.id,
    //   })
    // } else if (e.currentTarget.dataset.type == 'find') {
    //   wx.navigateTo({
    //     url: '../find/find',
    //   })
    // }
  },

  handleItemTap: function (e) {
    wx.navigateTo({
      url: `../movieDetail/movieDetail?id=${e.currentTarget.dataset.movieid}`
    })
  },

  // 获取绑定设备信息
  getBindedDevice: function () {
    let ccsession = wx.getStorageSync('new_cksession');
    console.log('监测当前是否有session值（无则获取不到绑定设备列表):', ccsession);
    if (ccsession == null || ccsession === "") return;
    let params = { ccsession: ccsession };
    let desParams = utils.paramsAssemble_wx(params);
    console.log('getBindedDevice params', desParams);
    console.log('getBindedDevice url', api.getBindDeviceListUrl);
    utils.request(api.getBindDeviceListUrl, 'GET', desParams,
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
        utils.refreshBindedTVStatus(app.globalData.activeId);
      },
      function (res) {
        console.log('获取绑定设备列表发生错误', res)
        utils.refreshBindedTVStatus(app.globalData.activeId);
      }
    )
  },
  jumpOutLink() {
    wx.navigateTo({
      url: '/pages/webview/webview',
    })
  },
  jumpMyFavorite() {
    console.log('jumpMyFavorite')
    wx.navigateTo({
      url: '/pages/favorite/favorite',
    })
  }
});
