Page({
  data: {
    curSrc: ''
  },

  onLoad: function (options) {
    //console.log(options)
    let id = options ? "123":"567"
    this.setData({
      curSrc: 'https://webx.coocaa.com/hfdplatform/yuqi/index.html?id=' + id
    })
    // wx.setNavigationBarTitle({
    //   title: options.title
    // })
  },

  onShow() {
    console.log('onShow')
  },

  onReady() {
    console.log('onReady')
  }
})  