Page({
  data: {
    
  },
  backHome:function(){
    wx.switchTab({
      url: '../my/my',
      success: function () {
        let page = getCurrentPages().pop()
        if (page == undefined || page == null) return;
        page.onShow()
      }
    })
  }
})