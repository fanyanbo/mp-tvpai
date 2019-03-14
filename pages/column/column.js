const utils = require('../../utils/util.js');
const api = require('../../api/api.js');
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShowTips: true,
    contentAll: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    const secret = app.globalData.secret
    const params = { "appkey": app.globalData.appkey, "target_id": options.id, "time": app.globalData.time, "tv_source": app.globalData.tvSource, "version_code": app.globalData.version_code}
    const sign = utils.encryptionIndex(params, secret)
    const url = api.recommendmorelistUrl
    let data = {
      appkey: app.globalData.appkey,
      target_id: options.id,
      time: app.globalData.time,
      tv_source: app.globalData.tvSource,
      version_code: app.globalData.version_code,
      sign: sign,      
    }
    utils.postLoading(url, 'GET', data, function (res) {
      console.log(res)
      if (res.data.data) {
          that.setData({
            contentAll: res.data.data
          })
      }else {
        console.log('streams fail:')
        console.log(res)
        wx.showToast({
          title: '加载数据失败',
        })
      }
    }, function (res) {
      console.log('streams fail:', res)
      wx.showToast({
        title: '加载数据失败',
      })
    }, function (res) {
      console.log('streams complete:', res)
    }, ""),
    wx.setNavigationBarTitle({
      title: options.title
    })

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