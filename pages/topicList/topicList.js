const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {

  },

  onLoad: function(options) {
    console.log(options)
  },


  onShow: function() {

  },

  onReady: function() {
    console.log('search onReady监听页面初次渲染完成');
    const {
      pxNavBarHeight,
      rpxNavBarHeight,
      ratio
    } = utils.getNavBarHeight();
    console.log(pxNavBarHeight, rpxNavBarHeight, ratio)
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  }
})  