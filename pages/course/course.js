// course.js
var app = getApp()
Page({
  data: {
    winWidth: 0,
    winHeight:0,
    // tab切换  
    currentTab: 0,
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        console.log(res.windowHeight)
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
          // clientHeight: res.windowHeight

        });
      }
    });
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this
    // that.data.winHeight
    wx.pageScrollTo({
      scrollTop: 0
    })
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  // back:function(){
  //   var pages = getCurrentPages();
  //   var currPage = pages[pages.length - 1];   //当前页面
  //   var prevPage = pages[pages.length - 2];  //上一个页面

  //   //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
  //   prevPage.setData({
  //     mydata: { a: 1, b: 2 }
  //   })
  //   wx.navigateBack({
      
  //   })
  // }
})  