const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    scrollHeight: '',
    contentList: ['','','']
  },

  onLoad: function (options) {
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.title || '片单详情'
    })
  },

  onShow() {
    wx.getSystemInfo({
      success: (res) => {
        console.log(res);
        let screenHeight = this.getContentHeight({ platform: res.platform, model: res.model })
        if (screenHeight === 0)
          screenHeight = res.screenHeight;
        console.log(screenHeight);
        // 状态栏高度和屏幕宽度，单位都是px
        this.setData({
          scrollHeight: screenHeight - 92,
        })
      }
    })
  },

  //根据不同设备和型号获取不同内容高度
  getContentHeight: function ({ platform, model }) {
    if (platform.match(/ios/i)) {
      if (model.match(/iPhone8/i)) {
        return 600;
      } else if (model.match(/iPhone10/i)) {
        return 630
      } else if (model.match(/iPhone11/i)) {
        return 700;
      } else {
        return 650;
      }
    } else {
      return 0;
    }
  },

  upper: function (event) {
    console.log('trigger upper');
  },

  lower: function (event) {
    console.log('trigger lower');
  },
})  