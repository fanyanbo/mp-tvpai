const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {

  },

  onLoad: function (options) {
    console.log(options)
    this.getTopicDetail()
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

  // 获取片单数据
  getTopicDetail: function () {
    utils.requestP(api.getTopicUrl, utils.paramsAssemble_tvpai()).then(res => {
      console.log('获取片单数据:', res)
      console.log('转换前日期：', res.data.data[0].start_datetime)
      let date = new Date(res.data.data[0].start_datetime)
      let date2 = `${date.getFullYear()}-${date.getMonth()+1}`
      console.log('转换后日期：', date2)
    }).catch(res => {
      console.log('获取片单数据发生错误', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  }
})  