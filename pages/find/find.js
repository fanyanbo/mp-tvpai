let utils = require('../../utils/util.js');
let appJs = require('../../app.js');
let api = require('../../api/api.js');
let app = getApp()

Page({
  data: {
    isShowTips : true,
    bIphoneFullScreenModel: false,
    page: '1',
    pageSize: '10',
    banners: [],
    hasMoreData: true,
    streams: [],
    indicatorDots: true,
    autoplay: true,
    indicatorColor: '#ececec',
    indicatorActiveColor: '#acacac',
    interval: 5000,
    duration: 500
  },
  listenSwiper: function (e) {
  },
  getActiveId: function () {
    console.log('获取激活id中')
    const ccsession = wx.getStorageSync('new_cksession')
    const url = api.getDevicesUrl
    const key = app.globalData.key
    let paramsStr = { "ccsession": ccsession }
    const sign = utils.encryption(paramsStr, key)
    let data = {
      client_id: app.globalData.client_id,
      sign: sign,
      param: paramsStr
    }
    utils.postLoading(url, 'GET', data, function (res) {
      if (res.data.result && res.data.data) {
        console.log("获取设备激活id:" + res.data.data[0].serviceId);
        app.globalData.activeid = res.data.data[0].serviceId;
      }
    }, function (res) {

    }, function (res) {

    }, '')
  },
  // 获取轮播图数据
  getBanners: function (message) {
    let that = this
    const url = api.getBannersUrl
    const key = app.globalData.key
    const sign = utils.encryption({}, key)
    let data = {
      client_id: app.globalData.client_id,
      sign: sign,
      param: {}
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log('banners success:', res)
      if (res.data && res.data.data) {
        if (res.data.data.length > 5) {
          that.setData({
            banners: res.data.data.slice(0, 5)
          })
        } else {
          that.setData({
            banners: res.data.data
          })
        }
      }
    }, function (res) {
      console.log('banners fail:', res)
      wx.showToast({
        title: '加载轮播数据失败',
      })
    }, function (res) {
      console.log('banners complete:', res)
    }, message)
  },
  // 获取信息流
  getStreams: function (message) {
    let that = this
    const url = api.getStreamsUrl
    const key = app.globalData.key
    const page = that.data.page
    const pageSize = that.data.pageSize
    const params = { "page": page, "pageSize": pageSize }
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
            streams: getPeriods(streamsTm.concat(streams)),
            hasMoreData: false
          })
        } else {
          that.setData({
            streams: getPeriods(streamsTm.concat(streams)),
            hasMoreData: true,
            page: parseInt(that.data.page) + 1 + ''
          })
        }
      } else {
        wx.showToast({
          title: res.data.message,
        })
      }
    }, function (res) {
      console.log('streams fail:',res)
      wx.showToast({
        title: '加载数据失败',
      })
    }, function (res) {
      console.log('streams complete:',res)
    }, message)
  },
  // onTabItemTap: function(items) {
  //   console.log('onTabItemTap',items)
  //   this.remoteCtrl.hideRemoteControl()
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBanners('加载中')
    this.getStreams('')
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getActiveId()
    this.remoteCtrl = this.selectComponent("#remotecontrol-id")
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.data.page = '1'
    this.getBanners('正在刷新数据')
    this.getStreams('正在刷新数据')
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      this.getStreams('加载中')
    } else {
      this.setData({
        hasMoreData: false
      })
    }
  }
})
// 获取期数
function getPeriods(e) {
  let data = e, dl = data.length, firstTime = getMonthDay(data[0].createTime)
  data[0].createTime = firstTime
  for (let i = 1; i < dl; i++) {
    if (getMonthDay(data[i].createTime) == firstTime) {
      data[i].createTime = 'period'
    } else {
      firstTime = getMonthDay(data[i].createTime)
      data[i].createTime = firstTime
    }
  }
  return data
}
function getMonthDay(d) {
  var date = new Date(d);
  return (date.getMonth() + 1) + '月' + date.getDate() + '日'
}
