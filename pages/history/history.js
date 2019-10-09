// author: fanyanbo
// email: fanyanbo@coocaa.com
// date: 2019-10-09
// des: 推送历史页面

const utils = require('../../utils/util')
const utils_fyb = require('../../utils/util_fyb')
const api = require('../../api/api_fyb')
const app = getApp()

Page({
  data: {
    isShowTips: false,
    bIphoneFullScreenModel: false,
    showoverList: false,
    isShowNone: false,
    historyList: [],
    isEditStatus: false, //是否为编辑状态
    isSelectAll: false,
    deleteListStr: '', //待删除历史项列表串
    selectLength: 0,
  },
  
  // 编辑
  handleEditClick: function () {
    this.setData({
      isEditStatus: true,
    })
  },

  // 取消编辑
  handleCancelEditClick: function () {
    this.setData({
      isEditStatus: false,
    })
  },

  // 选择
  handleSelectClick: function (e) { 
    if (!this.data.isEditStatus) {
      wx.navigateTo({
        url: `../../pages/movieDetail/movieDetail?id=${e.currentTarget.dataset.albumid}`
      })
    } else {
      let selectArr = []
      let historyArr = this.data.historyList
      let index = e.currentTarget.dataset.id
      console.log(historyArr, index)
      for (let i = 0; i < historyArr.length; i++) {
        let list = this.data.historyList[i].list
        for (let j = 0; j < list.length; j++) {
          if (list[j].id === index) {
            list[j].checked = !list[j].checked
          }
          if (list[j].checked) {
            selectArr.push(list[j].video_id)
          }
        }
      }
      let selectStr = selectArr.join(",")
      console.log(selectStr)
      this.setData({
        historyList: historyArr,
        deleteListStr: selectStr,
        selectLength: selectArr.length
      })
    }
  },

  // 删除
  handleDeleteClick: function () {
    let delStr = `{${this.data.deleteListStr}}`
    console.log(delStr)
    if (delStr.length === 2) return

    let params = {
      "del_ids": delStr
    };
    let desParams = utils_fyb.paramsAssemble_tvpai(params)
    utils_fyb.requestP(api.delPushHistoryUrl, desParams).then(res => {
      console.log('删除历史项成功', res.data)
      if (res.data.code === 0) {
        wx.showToast({
          title: '删除成功'
        })
        setTimeout(() => {
          this.getHistoryList()
        }, 200)    
      }
    }).catch(res => {
      console.log('删除历史项发生错误', res)
      utils.showToastBox("加载数据失败", "loading")
    })
  },

  // 全选
  handleSelectAllClick: function () {
    this.setData({
      isSelectAll: true
    })
    let arr = this.data.historyList
    let selectArr = []
    for (let i = 0; i < arr.length; i++) {
      let list = arr[i].list
      for (let j = 0; j < list.length; j++) {
        if (list[j].checked) {
          selectArr.push(list[j].video_id)
        } else {
          list[j].checked = true
          selectArr.push(list[j].video_id)
        }
      }
    }
    let selectStr = selectArr.join(",")
    console.log(selectStr)
    this.setData({
      historyList: arr,
      deleteListStr: selectStr,
      selectLength: selectArr.length
    })
  },

  // 取消全选
  handleCancelSelectAllClick: function () {
    this.setData({
      isSelectAll: false
    })
    let arr = this.data.historyList
    for (let i = 0; i < arr.length; i++) {
      let list = arr[i].list
      for (let j = 0; j < list.length; j++) {
        list[j].checked = false
      }
    }
    this.setData({
      historyList: arr,
      deleteListStr: '',
      selectLength: 0
    })
  },

  // 获取历史列表
  getHistoryList: function () {
    let desParams = utils_fyb.paramsAssemble_tvpai()
    utils_fyb.requestP(api.getHistoryListUrl, desParams).then(res => {
      console.log('获取历史列表成功', res.data)
      if (res.data.data) {
        let _withinObj = {}, _overObj = {}
        let withinList = res.data.data.movies_within_serven_days
        let overList = res.data.data.movies_over_serven_days
        for (let i = 0; i < res.data.data.movies_within_serven_days.length; i++) {
          withinList[i].checked = false
          withinList[i].id = i
        }
        for (let i = 0; i < res.data.data.movies_over_serven_days.length; i++) {
          overList[i].checked = false
          overList[i].id = res.data.data.movies_within_serven_days.length + i
        }

        _withinObj['time'] = "一周内"
        _withinObj['list'] = withinList
        _overObj['time'] = "更早"
        _overObj['list'] = overList

        let historyList = []
        if (withinList.length !== 0) historyList.push(_withinObj)
        if (overList.length !== 0) historyList.push(_overObj)
        
        console.log(historyList, withinList.length, overList.length)
        if (withinList.length === 0 && overList === 0) {
          this.setData({
            isShowNone: true,
            historyList: historyList,
            isEditStatus: false,
            selectLength: 0,
          })
        } else {
          this.setData({
            isShowNone: false,
            historyList: historyList,
            isEditStatus: false,
            selectLength: 0, 
          })
        }
      }
    }).catch(res => {
      console.log('获取历史列表发生错误', res)
      wx.showToast({
        title: '加载数据失败'
      })
      this.setData({
        isShowNone: true,
      })
    })
  },

  onLoad: function () {
    utils.showToastBox('加载中...', "loading")
    this.getHistoryList();
  },

  onShow: function () {
    this.setData({
      bIphoneFullScreenModel: app.globalData.bIphoneFullScreenModel
    });
  },

  handleGobackClick: function () {
    console.log('handleGobackClick')
    utils_fyb.navigateBack()
  }
})