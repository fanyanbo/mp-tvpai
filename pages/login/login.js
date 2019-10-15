// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginTips: '请与电视端使用相同的登录方式\n多端共享,极致体验',
    arrLoginType: [
      { id: 1, type: '微信登录', image: '../../images/login/wechat.png'},
      { id: 2, type: '手机登录', image: '../../images/login/mob.png' },
      { id: 3, type: '账号登录', image: '../../images/login/acct.png' },
    ]
  },
  startLogin(e) { //开始登录
    let id = e.currentTarget.dataset.id
    console.log('login type: '+id)
    if(id == 1) {
      //todo 跳转到后台微信登录页，
    }else {
        wx.navigateTo({
          url: `../login/login?id=${id}`,
        })
    }
  },
  handleGobackClick(e){ //返回
    wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})