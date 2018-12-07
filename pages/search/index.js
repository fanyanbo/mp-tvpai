Page({
  data: {
    titleContent: '热搜',
    paddingTop: 0,
    isFocus: true,
    inputValue: ''
  },

  handleReturnTap() {
    console.log('搜索输入页 handleReturnTap');
    wx.navigateBack();
  },

  handleDeteteTap () {
    console.log('搜索输入页 handleDeteteTap');
    this.setData({
      inputValue: ''
    })
  },

  inputBind(e) {
    console.log('搜索输入页 inputBind = ' + e.detail.value);
    this.setData({
      inputValue: e.detail.value
    })
  },

  handleCancelTap() {
    console.log('搜索输入页 handleCancelTap');
    wx.navigateBack();
  },

  onLoad(options) {
    console.log('second onLoad监听页面加载');
  },

  onReady() {
    console.log('second onReady监听页面初次渲染完成');
  },

  onShow() {
    console.log('second onShow监听页面显示');
    wx.getSystemInfo({
      success: (res) => {
        // 状态栏高度和屏幕宽度，单位都是px
        console.log(res.statusBarHeight, res.windowWidth);
        let scale = res.windowWidth / 375;
        this.setData({
          paddingTop: res.statusBarHeight
        })
      }
    }) 
  },

  onHide() {
    console.log('second onHide监听页面隐藏');
  },

  onUnload() {
    console.log('second onUnload监听页面卸载');
  }
});
