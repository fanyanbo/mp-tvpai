// author: fanyanbo
// email: fanyanbo@coocaa.com
// date: 2019-09-23
// des: 推荐分类更多内容页

const api = require('../../api/api_fyb')
const utils = require('../../utils/util_fyb')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShowTips: true,
    bIphoneFullScreenModel: false,
    isContentEmpty: false,
    contentList: [],
    errIconUrl: '../../images/close_icon.png',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.showLoadingToast()
    this.setData({
      navBarTitle: options.title
    })
    let params = { "target_id": options.id }
    let desParams = utils.paramsAssemble_tvpai(params)
    utils.requestP(api.getRecommendMoreListUrl, desParams).then(res => {
      console.log('获取分类更多数据:', res)
      utils.showLoadingToast('', false)
      if (res.data.data) {
        this.setData({
          contentList: res.data.data
        })
      } else {
        console.log('获取分类更多数据失败:', res)
        // utils.showFailedToast('加载数据失败', this.data.errIconUrl)
        this.setData({ isContentEmpty: true })
      }
    }).catch(res => {
      console.log('获取分类更多数据发生错误:', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
      this.setData({ isContentEmpty: true })
    }) 
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  handleItemClick: function (e) {
    wx.navigateTo({
      url: `../movieDetail/movieDetail?id=${e.currentTarget.dataset.id}&from=column`
    })    
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
    this.setData({
      isShowTips: app.globalData.isShowTips,
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
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