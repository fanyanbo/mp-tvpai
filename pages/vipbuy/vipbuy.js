// pages/vipbuy/vipbuy.js
const user_mock = require('../../api/user/mock')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productList:null,
    PageStage: {
      HOME_PAGE: 0,
      PAY_SUCCESS_PAGE: 1,
      PAY_FAIL_PAGE: 2,
    },
    stage: 0,
  },

  handleGobackClick(e) {//返回
    wx.navigateBack({})
  },
  payNow(e) { //立即支付
    let stage = this.data.PageStage.PAY_SUCCESS_PAGE
    if(Math.random()*10 < 5) { //test
      stage = this.data.PageStage.PAY_FAIL_PAGE
    }
    wx.navigateTo({
      url: `../vipbuy/vipbuy?stage=${stage}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(user_mock.package_list_data.data.products)
    this.setData({
      productList: user_mock.package_list_data.data.products
    })

    console.log(options)
    if (!!+options.stage) {
      this.setData({
        stage: +options.stage
      })
    }
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