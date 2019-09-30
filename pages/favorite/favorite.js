const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    tabbarList: ['影片', '片单', '文章'],
    activeIndex: 0, //tabbar索引
    videoToday: true,
    videoWeekend: true,
    videoAgo: true,
    topicToday: true,
    topicWeekend: true,
    topicAgo: true,
    articleToday: true,
    articleWeekend: true,
    articleAgo: true,
    isEdit: false, //是否是编辑状态
  },

  onLoad: function (options) {
    console.log(options)
  },


  onShow: function () {

  },

  onReady: function () {
    console.log('search onReady监听页面初次渲染完成');
    const {
      pxNavBarHeight,
      rpxNavBarHeight,
      ratio
    } = utils.getNavBarHeight();
    console.log(pxNavBarHeight, rpxNavBarHeight, ratio)
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  handleTabbarClick: function (e) {
    const _activeIndex = e.currentTarget.dataset['index'];
    console.log('切换tabbar activeIndex =' + _activeIndex);
    this.setData({
      activeIndex: _activeIndex
    })
  },

  handleEditClick: function () {
    console.log('handleEditClick')
    this.setData({
        isEdit: true
    })
  },

  handleCancelClick: function () {
    console.log('handleCancelClick')
    this.setData({
        isEdit: false
    })
  },

  handleSelectAllClick: function () {
    console.log('handleSelectAllClick')
  },

  handleRemoveClick: function () {
    console.log('handleRemoveClick')
  },

  handleSelectClick: function () {
    console.log('handleSelectClick')
  }

})  