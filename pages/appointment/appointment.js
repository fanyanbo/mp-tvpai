const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    appointmentList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  }

})