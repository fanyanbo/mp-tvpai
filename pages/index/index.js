Page({
  data: {
    navbarActiveIndex: 0,
    navbarTitle: [
      "主页",
      "发现",
      "我的"
    ]
  },

  /**
 * 点击导航栏
 */
  onNavBarTap: function (event) {
    // 获取点击的navbar的index
    let navbarTapIndex = event.currentTarget.dataset.navbarIndex
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: navbarTapIndex
    })
  },

  /**
   * 
   */
  onBindAnimationFinish: function ({ detail }) {
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: detail.current
    })
  },

  onLoad(options) {
    console.log('first onLoad监听页面加载');
  },

  onReady() {
    console.log('first onReady监听页面初次渲染完成');
  },

  onShow() {
    console.log('first onShow监听页面显示');
  },

  onHide() {
    console.log('first onHide监听页面隐藏');
  },

  onUnload() {
    console.log('first onUnload监听页面卸载');
  }
});
