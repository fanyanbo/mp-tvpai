// pages/userProtocol/userprotocol.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 'movie-iqiyi',
    aboutAutoRenew: true,
  },
  handleGobackClick(e) {//返回
    wx.navigateBack()
  },
  toggleReadAutoRenew(e) { //自动续费协议页-切换显示‘关于’和‘取消’
    let show = true
    if(e.currentTarget.dataset.content == 'cancel') {
      show = false
    }
    this.setData({
      aboutAutoRenew: show
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.type)
    let type = options.type
    if (type == 'movie') {
      if (getApp().globalData.boundDeviceInfo.source == "tencent") {
        type = 'movie-tencent'
      }else {
        type = 'movie-iqiyi'
      }
    }
    this.setData({
      type: type
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