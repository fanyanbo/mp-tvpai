const utils = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    topicList: [],
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
      if (res.data.data) {
        let _map = new Map()
        for (let i = 0; i < res.data.data.length; i++) {
          let _date = new Date(res.data.data[i].start_datetime)
          let _formatDate = `${_date.getFullYear()}年${_date.getMonth() + 1}月`
          if (_map.has(_formatDate)) {
            let _valueList = _map.get(_formatDate)
            _valueList.push(res.data.data[i])
            _map.set(_formatDate, _valueList)
          } else {
            let _valueList = []
            _valueList.push(res.data.data[i])
            _map.set(_formatDate, _valueList)
          }
        }
        // 转换成数组，方便排序
        let arrayObj = Array.from(_map)
        // 数组排序，注意数字字符串的比较
        arrayObj.sort(function (a, b) { 
          let aMatches = a[0].match(/\d+/g)
          let bMatches = b[0].match(/\d+/g)
          if (aMatches[0] === bMatches[0]) {
            return bMatches[1] - aMatches[1]
          } else {
            return bMatches[0] - aMatches[0]
          }
          // return b[0].localeCompare(a[0]) 
        })
        this.setData({
          topicList: arrayObj
        })
        console.log(arrayObj)
      }

    }).catch(res => {
      console.log('获取片单数据发生错误', res)
      utils.showFailedToast('加载数据失败', this.data.errIconUrl)
    })
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils.navigateBack()
  },

  handleItemClick: function (e) {
    console.log('handleItemClick')
    wx.navigateTo({
      url: `../topicDetail/topicDetail?id=${e.currentTarget.dataset.id}`,
    });
  }
})  