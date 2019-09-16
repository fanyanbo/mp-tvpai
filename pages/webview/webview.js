Page({
  data: {
    curSrc: ''
  },

  onLoad: function (options) {
    console.log(options)
    this.setData({
      curSrc: 'https://www.baidu.com'
    })
    wx.setNavigationBarTitle({
      title: options.title
    })
  },

  onShow() {
    console.log('onShow')
  },

  onReady() {
    console.log('onReady')
  }
})  