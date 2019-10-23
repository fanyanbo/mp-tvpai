const utils = require('../../utils/util_fyb')
const app = getApp()

Page({
  data: {
    curSrc: ''
  },

  onLoad: function (options) {
    console.log(options)
    let paramsObj = {
      platform: app.globalData.platform,
      source: utils.getTvsource()
    }
    let paramsStr = JSON.stringify(paramsObj)
    let _path = `${options.path}?baseInfo=${paramsStr}`
    console.log(_path)
    // _path = "http://beta.webapp.skysrt.com/fyb/miniapp/index.html"
    // _path = "https://webapp.skysrt.com/miniapp/log/index.html"
    // _path = "http://www.baidu.com"
    this.setData({curSrc: _path})
    // this.setData({
    //   curSrc: 'https://webx.coocaa.com/hfdplatform/yuqi/index.html?objString=' + objString
    // })
    // wx.setNavigationBarTitle({
    //   title: options.title
    // })
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