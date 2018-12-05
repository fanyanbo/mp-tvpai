Page({
  data: {

  },

  onLoad(options) {
    console.log('second onLoad监听页面加载');
  },

  onReady() {
    console.log('second onReady监听页面初次渲染完成');
  },

  onShow() {
    console.log('second onShow监听页面显示');
  },

  onHide() {
    console.log('second onHide监听页面隐藏');
  },

  onUnload() {
    console.log('second onUnload监听页面卸载');
  }
});
