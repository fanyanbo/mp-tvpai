const utils = require('../../utils/util.js');
const api = require('../../api/api.js');
const utils_fyb = require('../../utils/util_fyb');
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShowTips: true,
    bIphoneFullScreenModel:false,
    isShowDoc:false,
    contentAll: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.showToastBox('加载中...', "loading")
    let that = this
    let params = { "target_id": options.id};
      let desParams = utils_fyb.paramsAssemble_tvpai(params);
    utils_fyb.request(api.recommendmorelistUrl, 'GET', desParams, function (res) {
      console.log(res)
      if (res.data.data) {
          that.setData({
            contentAll: res.data.data
          })
      }else {
        console.log('streams fail:')
        console.log(res)
        that.setData({ isShowDoc: true });
        wx.showToast({
          title: '加载数据失败',
        })
      }
    }, function (res) {
      console.log('streams fail:', res)
      wx.showToast({
        title: '加载数据失败',
      })
      that.setData({ isShowDoc: true });
    }, function (res) {
      console.log('streams complete:', res)
    }, ""),
    wx.setNavigationBarTitle({
      title: options.title
    })

  },
  onRCShowEvent: function (e) {
    console.log('onRCShowEvent..e:', e.detail)
    //遥控器面板显示时，宿主页面不响应上下滑动；
    this.setData({
      bWholePageFixed: (e && e.detail.brcshow) ? true : false
    })
    console.log('onRCShowEvent..bWholePageFixed:', this.data.bWholePageFixed)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})